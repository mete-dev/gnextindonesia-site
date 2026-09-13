// Odoo Module Exporter for Gnext Indonesia
import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, "odoo_addons", "gnext_indonesia");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(relPath, content) {
  const full = path.join(OUT_DIR, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content.trim() + "\n", "utf-8");
  console.log("✓ Generated:", relPath);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const items = fs.readdirSync(src);
  for (const item of items) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

console.log("🚀 Memulai proses generate Odoo Addons module [gnext_indonesia]...");

// 1. MANIFEST
write("__manifest__.py", `# -*- coding: utf-8 -*-
{
    'name': 'Gnext Indonesia - Media & Publishing Platform',
    'version': '1.0.0',
    'summary': 'Manajemen Konten Berita Multi-Portal, Redaksi Pers, Portofolio, dan Pengaturan Portal Gnext',
    'sequence': 10,
    'description': """
Gnext Indonesia Media Platform
==============================
Modul Odoo terintegrasi untuk pengelolaan media berita multi-portal:
* Gnext Indonesia (Utama)
* Yoiki Jatim (Portal Regional Jawa Timur)
* Lumajang Talks (Portal Regional Lumajang)

Fitur:
------
* Manajemen Artikel & Publikasi (Draft, Published, Archived)
* Manajemen Kategori & Hierarki Berita
* Staf Redaksi & Manajemen Peran (Administrator, Manajer Pers, Penulis Pers)
* Portofolio Karya Kreatif & Mitra (Partners)
* Konfigurasi Portal Web & Lokasi Wilayah
* Integrasi SEO & Metadata Open Graph
    """,
    'category': 'Website/Media',
    'author': 'Gnext Indonesia Creative Studio',
    'website': 'https://gnextindonesia.com',
    'license': 'LGPL-3',
    'depends': ['base', 'mail', 'website'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/gnext_category_data.xml',
        'data/gnext_setting_data.xml',
        'data/gnext_user_data.xml',
        'data/gnext_article_data.xml',
        'views/gnext_category_views.xml',
        'views/gnext_article_views.xml',
        'views/gnext_setting_views.xml',
        'views/gnext_partner_views.xml',
        'views/menus.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'images': ['static/description/icon.png'],
}`);

write("__init__.py", `# -*- coding: utf-8 -*-
from . import models
`);

write("models/__init__.py", `# -*- coding: utf-8 -*-
from . import gnext_category
from . import gnext_article
from . import gnext_setting
from . import gnext_partner
`);

// 2. MODELS
write("models/gnext_category.py", `# -*- coding: utf-8 -*-
from odoo import models, fields, api

class GnextCategory(models.Model):
    _name = 'gnext.category'
    _description = 'Kategori Berita Gnext'
    _order = 'name asc'

    name = fields.Char(string='Nama Kategori', required=True, translate=True)
    slug = fields.Char(string='Slug URL', required=True, index=True)
    parent_id = fields.Many2one('gnext.category', string='Kategori Induk', ondelete='set null')
    child_ids = fields.One2many('gnext.category', 'parent_id', string='Sub-Kategori')
    article_count = fields.Integer(string='Jumlah Artikel', compute='_compute_article_count')
    active = fields.Boolean(string='Aktif', default=True)

    _sql_constraints = [
        ('slug_uniq', 'unique(slug)', 'Slug kategori harus unik!'),
    ]

    def _compute_article_count(self):
        for rec in self:
            rec.article_count = self.env['gnext.article'].search_count([('category_id', '=', rec.id)])
`);

write("models/gnext_article.py", `# -*- coding: utf-8 -*-
from odoo import models, fields, api

class GnextArticle(models.Model):
    _name = 'gnext.article'
    _description = 'Artikel & Berita Gnext'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date desc, id desc'

    title = fields.Char(string='Judul Artikel', required=True, tracking=True)
    category_id = fields.Many2one('gnext.category', string='Kategori', required=True, tracking=True)
    sub_category = fields.Char(string='Sub Kategori')
    author_id = fields.Many2one('res.users', string='Penulis/Jurnalis', default=lambda self: self.env.user, tracking=True)
    date = fields.Date(string='Tanggal Terbit', default=fields.Date.context_today, required=True)
    
    portal = fields.Selection([
        ('gnext', 'Gnext Indonesia (Utama)'),
        ('yoikijatim', 'Yoiki Jatim'),
        ('lumajangtalks', 'Lumajang Talks'),
    ], string='Portal Berita', default='gnext', required=True, tracking=True)

    status = fields.Selection([
        ('draft', 'Draft / Review'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ], string='Status', default='published', required=True, tracking=True)

    content = fields.Html(string='Isi Konten Artikel', sanitize=False)
    tags = fields.Char(string='Tags (Dipisah Koma)')
    views = fields.Integer(string='Jumlah Dilihat (Views)', default=0, readonly=True)
    
    # Media & Cover
    cover_image = fields.Char(string='URL Cover Image')
    cover_binary = fields.Binary(string='Upload Cover Image')
    image_caption = fields.Char(string='Keterangan Gambar (Caption)')
    image_credit = fields.Char(string='Kredit Foto/Gambar')
    
    # Lokasi
    news_location = fields.Char(string='Lokasi Berita', default='Nasional')
    
    # SEO & Open Graph
    og_title = fields.Char(string='OG / Meta Title')
    og_description = fields.Text(string='OG / Meta Description')
    og_image = fields.Char(string='OG Image URL')

    def action_publish(self):
        for rec in self:
            rec.status = 'published'

    def action_draft(self):
        for rec in self:
            rec.status = 'draft'

    def action_archive(self):
        for rec in self:
            rec.status = 'archived'
`);

write("models/gnext_setting.py", `# -*- coding: utf-8 -*-
from odoo import models, fields

class GnextWebSetting(models.Model):
    _name = 'gnext.web.setting'
    _description = 'Pengaturan Halaman & Wilayah Portal Gnext'

    path = fields.Char(string='Path / Identifier', required=True)
    title = fields.Char(string='Judul Pengaturan', required=True)
    description = fields.Text(string='Deskripsi')
    content = fields.Text(string='Nilai / Konten Konfigurasi')
    portal_id = fields.Char(string='Portal Terkait')

    _sql_constraints = [
        ('path_uniq', 'unique(path)', 'Path pengaturan harus unik!'),
    ]
`);

write("models/gnext_partner.py", `# -*- coding: utf-8 -*-
from odoo import models, fields

class GnextPartner(models.Model):
    _name = 'gnext.partner'
    _description = 'Mitra & Kolaborator Gnext'

    name = fields.Char(string='Nama Partner / Organisasi', required=True)
    logo_url = fields.Char(string='URL Logo')
    logo_binary = fields.Binary(string='File Logo')
    website = fields.Char(string='Website Resmi')

class GnextWork(models.Model):
    _name = 'gnext.work'
    _description = 'Portofolio Karya Gnext'

    name = fields.Char(string='Judul / Topik Karya', default='Portofolio')
    instagram_url = fields.Char(string='Link Instagram Konten', required=True)
    description = fields.Text(string='Deskripsi Singkat')
`);

// 3. SECURITY
write("security/security.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="0">
        <record id="group_gnext_penulis" model="res.groups">
            <field name="name">Penulis Pers</field>
        </record>

        <record id="group_gnext_manager" model="res.groups">
            <field name="name">Manajer Pers</field>
            <field name="implied_ids" eval="[(4, ref('group_gnext_penulis'))]"/>
        </record>

        <record id="group_gnext_admin" model="res.groups">
            <field name="name">Administrator</field>
            <field name="implied_ids" eval="[(4, ref('group_gnext_manager'))]"/>
            <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
        </record>
    </data>
</odoo>
`);

write("security/ir.model.access.csv", `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_gnext_category_user,gnext.category.penulis,model_gnext_category,group_gnext_penulis,1,0,0,0
access_gnext_category_manager,gnext.category.manager,model_gnext_category,group_gnext_manager,1,1,1,1
access_gnext_article_user,gnext.article.penulis,model_gnext_article,group_gnext_penulis,1,1,1,0
access_gnext_article_manager,gnext.article.manager,model_gnext_article,group_gnext_manager,1,1,1,1
access_gnext_setting_manager,gnext.web.setting.manager,model_gnext_web_setting,group_gnext_manager,1,1,1,1
access_gnext_partner_manager,gnext.partner.manager,model_gnext_partner,group_gnext_manager,1,1,1,1
access_gnext_work_manager,gnext.work.manager,model_gnext_work,group_gnext_manager,1,1,1,1
`);

// 4. VIEWS
write("views/gnext_category_views.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_gnext_category_tree" model="ir.ui.view">
        <field name="name">gnext.category.tree</field>
        <field name="model">gnext.category</field>
        <field name="arch" type="xml">
            <tree string="Kategori Berita">
                <field name="name"/>
                <field name="slug"/>
                <field name="parent_id"/>
                <field name="article_count"/>
                <field name="active"/>
            </tree>
        </field>
    </record>

    <record id="view_gnext_category_form" model="ir.ui.view">
        <field name="name">gnext.category.form</field>
        <field name="model">gnext.category</field>
        <field name="arch" type="xml">
            <form string="Kategori Berita">
                <sheet>
                    <div class="oe_title">
                        <label for="name" string="Nama Kategori"/>
                        <h1><field name="name" placeholder="Misal: Teknologi, Bisnis, Kreatif"/></h1>
                    </div>
                    <group>
                        <group>
                            <field name="slug"/>
                            <field name="parent_id"/>
                        </group>
                        <group>
                            <field name="active"/>
                            <field name="article_count"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Sub-Kategori">
                            <field name="child_ids">
                                <tree>
                                    <field name="name"/>
                                    <field name="slug"/>
                                </tree>
                            </field>
                        </page>
                    </notebook>
                </sheet>
            </form>
        </field>
    </record>

    <record id="action_gnext_category" model="ir.actions.act_window">
        <field name="name">Kategori Berita</field>
        <field name="res_model">gnext.category</field>
        <field name="view_mode">tree,form</field>
    </record>
</odoo>
`);

write("views/gnext_article_views.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_gnext_article_tree" model="ir.ui.view">
        <field name="name">gnext.article.tree</field>
        <field name="model">gnext.article</field>
        <field name="arch" type="xml">
            <tree string="Daftar Artikel &amp; Berita" decoration-info="status == 'draft'" decoration-success="status == 'published'" decoration-muted="status == 'archived'">
                <field name="title"/>
                <field name="portal" widget="badge"/>
                <field name="category_id"/>
                <field name="author_id"/>
                <field name="date"/>
                <field name="views"/>
                <field name="status" widget="badge" decoration-success="status == 'published'" decoration-warning="status == 'draft'"/>
            </tree>
        </field>
    </record>

    <record id="view_gnext_article_form" model="ir.ui.view">
        <field name="name">gnext.article.form</field>
        <field name="model">gnext.article</field>
        <field name="arch" type="xml">
            <form string="Artikel &amp; Berita">
                <header>
                    <button name="action_publish" string="Terbitkan (Publish)" type="object" class="oe_highlight" invisible="status == 'published'"/>
                    <button name="action_draft" string="Kembalikan ke Draft" type="object" invisible="status == 'draft'"/>
                    <button name="action_archive" string="Arsipkan" type="object" invisible="status == 'archived'"/>
                    <field name="status" widget="statusbar" statusbar_visible="draft,published,archived"/>
                </header>
                <sheet>
                    <div class="oe_title">
                        <label for="title" string="Judul Berita / Artikel"/>
                        <h1><field name="title" placeholder="Ketikkan judul artikel yang memikat..."/></h1>
                    </div>
                    <group>
                        <group string="Informasi Portal &amp; Kategori">
                            <field name="portal"/>
                            <field name="category_id"/>
                            <field name="sub_category"/>
                            <field name="news_location"/>
                        </group>
                        <group string="Penerbitan">
                            <field name="author_id"/>
                            <field name="date"/>
                            <field name="tags" placeholder="e.g. teknologi, ai, startup"/>
                            <field name="views"/>
                        </group>
                    </group>

                    <notebook>
                        <page string="Konten Utama" name="content">
                            <field name="content" options="{'collaborative': true, 'resizable': true}"/>
                        </page>
                        <page string="Cover &amp; Media" name="media">
                            <group>
                                <group>
                                    <field name="cover_image" placeholder="https://..."/>
                                    <field name="cover_binary" widget="image"/>
                                </group>
                                <group>
                                    <field name="image_caption"/>
                                    <field name="image_credit"/>
                                </group>
                            </group>
                        </page>
                        <page string="SEO &amp; Open Graph" name="seo">
                            <group>
                                <field name="og_title"/>
                                <field name="og_description"/>
                                <field name="og_image"/>
                            </group>
                        </page>
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <record id="view_gnext_article_search" model="ir.ui.view">
        <field name="name">gnext.article.search</field>
        <field name="model">gnext.article</field>
        <field name="arch" type="xml">
            <search string="Cari Artikel">
                <field name="title"/>
                <field name="tags"/>
                <field name="author_id"/>
                <field name="category_id"/>
                <filter string="Gnext Utama" name="portal_gnext" domain="[('portal', '=', 'gnext')]"/>
                <filter string="Yoiki Jatim" name="portal_yoikijatim" domain="[('portal', '=', 'yoikijatim')]"/>
                <filter string="Lumajang Talks" name="portal_lumajangtalks" domain="[('portal', '=', 'lumajangtalks')]"/>
                <separator/>
                <filter string="Published" name="published" domain="[('status', '=', 'published')]"/>
                <filter string="Draft" name="draft" domain="[('status', '=', 'draft')]"/>
                <group expand="0" string="Group By">
                    <filter string="Portal" name="groupby_portal" context="{'group_by': 'portal'}"/>
                    <filter string="Kategori" name="groupby_category" context="{'group_by': 'category_id'}"/>
                    <filter string="Status" name="groupby_status" context="{'group_by': 'status'}"/>
                    <filter string="Penulis" name="groupby_author" context="{'group_by': 'author_id'}"/>
                </group>
            </search>
        </field>
    </record>

    <record id="action_gnext_article" model="ir.actions.act_window">
        <field name="name">Artikel Berita</field>
        <field name="res_model">gnext.article</field>
        <field name="view_mode">tree,form</field>
        <field name="search_view_id" ref="view_gnext_article_search"/>
        <field name="context">{'search_default_published': 1}</field>
    </record>
</odoo>
`);

write("views/gnext_setting_views.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_gnext_web_setting_tree" model="ir.ui.view">
        <field name="name">gnext.web.setting.tree</field>
        <field name="model">gnext.web.setting</field>
        <field name="arch" type="xml">
            <tree string="Pengaturan Web &amp; Portal" editable="bottom">
                <field name="path"/>
                <field name="title"/>
                <field name="description"/>
                <field name="content"/>
                <field name="portal_id"/>
            </tree>
        </field>
    </record>

    <record id="action_gnext_web_setting" model="ir.actions.act_window">
        <field name="name">Pengaturan Portal &amp; Wilayah</field>
        <field name="res_model">gnext.web.setting</field>
        <field name="view_mode">tree</field>
    </record>
</odoo>
`);

write("views/gnext_partner_views.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_gnext_partner_tree" model="ir.ui.view">
        <field name="name">gnext.partner.tree</field>
        <field name="model">gnext.partner</field>
        <field name="arch" type="xml">
            <tree string="Mitra &amp; Partner" editable="bottom">
                <field name="name"/>
                <field name="logo_url"/>
                <field name="website"/>
            </tree>
        </field>
    </record>

    <record id="view_gnext_work_tree" model="ir.ui.view">
        <field name="name">gnext.work.tree</field>
        <field name="model">gnext.work</field>
        <field name="arch" type="xml">
            <tree string="Portofolio Karya" editable="bottom">
                <field name="name"/>
                <field name="instagram_url"/>
                <field name="description"/>
            </tree>
        </field>
    </record>

    <record id="action_gnext_partner" model="ir.actions.act_window">
        <field name="name">Mitra &amp; Partner</field>
        <field name="res_model">gnext.partner</field>
        <field name="view_mode">tree</field>
    </record>

    <record id="action_gnext_work" model="ir.actions.act_window">
        <field name="name">Katalog Portofolio Karya</field>
        <field name="res_model">gnext.work</field>
        <field name="view_mode">tree</field>
    </record>
</odoo>
`);

write("views/menus.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Top Menu -->
    <menuitem id="menu_gnext_root" name="Gnext Media" sequence="10" web_icon="gnext_indonesia,static/description/icon.png"/>

    <!-- Redaksi Menu -->
    <menuitem id="menu_gnext_news" name="Manajemen Berita" parent="menu_gnext_root" sequence="10"/>
    <menuitem id="menu_gnext_article" name="Artikel Berita" parent="menu_gnext_news" action="action_gnext_article" sequence="10"/>
    <menuitem id="menu_gnext_category" name="Kategori" parent="menu_gnext_news" action="action_gnext_category" sequence="20"/>

    <!-- Portofolio & Mitra -->
    <menuitem id="menu_gnext_portfolio" name="Portofolio &amp; Partner" parent="menu_gnext_root" sequence="20"/>
    <menuitem id="menu_gnext_work" name="Karya Instagram" parent="menu_gnext_portfolio" action="action_gnext_work" sequence="10"/>
    <menuitem id="menu_gnext_partner" name="Mitra Kolaborasi" parent="menu_gnext_portfolio" action="action_gnext_partner" sequence="20"/>

    <!-- Konfigurasi -->
    <menuitem id="menu_gnext_config" name="Konfigurasi" parent="menu_gnext_root" sequence="30"/>
    <menuitem id="menu_gnext_setting" name="Pengaturan Web &amp; Wilayah" parent="menu_gnext_config" action="action_gnext_web_setting" sequence="10"/>
</odoo>
`);

// 5. DATA XML
write("data/gnext_category_data.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="cat_teknologi" model="gnext.category">
            <field name="name">Teknologi</field>
            <field name="slug">teknologi</field>
        </record>
        <record id="cat_kreatif" model="gnext.category">
            <field name="name">Kreatif</field>
            <field name="slug">kreatif</field>
        </record>
        <record id="cat_bisnis" model="gnext.category">
            <field name="name">Bisnis</field>
            <field name="slug">bisnis</field>
        </record>
        <record id="cat_lifestyle" model="gnext.category">
            <field name="name">Lifestyle</field>
            <field name="slug">lifestyle</field>
        </record>
        <record id="cat_regional" model="gnext.category">
            <field name="name">Regional</field>
            <field name="slug">regional</field>
        </record>
    </data>
</odoo>
`);

write("data/gnext_setting_data.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="setting_home" model="gnext.web.setting">
            <field name="path">/</field>
            <field name="title">Home | Gnext Creative Studio</field>
            <field name="description">Ruang tumbuh bagi kreator muda.</field>
            <field name="portal_id">gnext</field>
        </record>
        <record id="setting_about" model="gnext.web.setting">
            <field name="path">/about</field>
            <field name="title">About Us | Gnext</field>
            <field name="description">Tentang Gnext Indonesia.</field>
            <field name="portal_id">gnext</field>
        </record>
        <record id="setting_work" model="gnext.web.setting">
            <field name="path">/work</field>
            <field name="title">Our Work | Gnext</field>
            <field name="description">Layanan dan portofolio kami.</field>
            <field name="portal_id">gnext</field>
        </record>
        <record id="setting_yoiki_locs" model="gnext.web.setting">
            <field name="path">yoikijatim-locations</field>
            <field name="title">Kategori Lokasi Yoiki Jatim</field>
            <field name="description">Daftar wilayah Jawa Timur</field>
            <field name="content">Surabaya, Malang, Banyuwangi, Jember, Kediri, Sidoarjo, Gresik, Probolinggo, Pasuruan, Tuban, Madiun, Blitar</field>
            <field name="portal_id">yoikijatim</field>
        </record>
        <record id="setting_lumajang_locs" model="gnext.web.setting">
            <field name="path">lumajangtalks-locations</field>
            <field name="title">Kategori Lokasi Lumajang Talks</field>
            <field name="description">Daftar wilayah Kabupaten Lumajang</field>
            <field name="content">Senduro, Pasrujambe, Klakah, Pronojiwo, Yosowilangun, Tempeh, Pasirian, Candipuro, Ranuyoso, Rowokangkung, Kunir, Tekung</field>
            <field name="portal_id">lumajangtalks</field>
        </record>
    </data>
</odoo>
`);

write("data/gnext_user_data.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="user_penulis_gnext" model="res.users">
            <field name="name">Penulis Lepas Gnext</field>
            <field name="login">penulis@gnextindonesia.com</field>
            <field name="groups_id" eval="[(6, 0, [ref('group_gnext_penulis')])]"/>
        </record>
        <record id="user_manager_gnext" model="res.users">
            <field name="name">Manajer Konten Gnext</field>
            <field name="login">manager@gnextindonesia.com</field>
            <field name="groups_id" eval="[(6, 0, [ref('group_gnext_manager')])]"/>
        </record>
        <record id="user_manager_yoiki" model="res.users">
            <field name="name">Manajer Yoiki Jatim</field>
            <field name="login">manager.yoiki@gnextindonesia.com</field>
            <field name="groups_id" eval="[(6, 0, [ref('group_gnext_manager')])]"/>
        </record>
        <record id="user_manager_lumajang" model="res.users">
            <field name="name">Manajer Lumajang Talks</field>
            <field name="login">manager.lumajang@gnextindonesia.com</field>
            <field name="groups_id" eval="[(6, 0, [ref('group_gnext_manager')])]"/>
        </record>
    </data>
</odoo>
`);

write("data/gnext_article_data.xml", `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="article_welcome_gnext" model="gnext.article">
            <field name="title">Selamat Datang di Portal Resmi Gnext Indonesia</field>
            <field name="category_id" ref="cat_teknologi"/>
            <field name="portal">gnext</field>
            <field name="status">published</field>
            <field name="news_location">Nasional</field>
            <field name="tags">gnext, media, startup, indonesia</field>
            <field name="og_title">Gnext Indonesia - Media &amp; Creative Hub</field>
            <field name="og_description">Platform publikasi dan jejaring kreator media digital masa kini.</field>
            <field name="content"><![CDATA[
                <h2>Menghubungkan Kreator dan Informasi Masa Depan</h2>
                <p>Gnext Indonesia hadir sebagai ekosistem media independen dan ruang tumbuh bagi para kreator, jurnalis muda, dan pegiat industri kreatif digital.</p>
            ]]></field>
        </record>

        <record id="article_yoiki_jatim_sample" model="gnext.article">
            <field name="title">Eksplorasi Potensi Ekonomi Kreatif dan Budaya Jawa Timur</field>
            <field name="category_id" ref="cat_regional"/>
            <field name="portal">yoikijatim</field>
            <field name="status">published</field>
            <field name="news_location">Surabaya</field>
            <field name="tags">jatim, surabaya, yoikijatim, budaya</field>
            <field name="content"><![CDATA[
                <h2>Jawa Timur: Pusat Pertumbuhan Kreator Regional</h2>
                <p>Yoiki Jatim meliput ragam dinamika kota dan kabupaten di Jawa Timur, mulai dari potensi lokal, destinasi kuliner, hingga inovasi generasi muda.</p>
            ]]></field>
        </record>

        <record id="article_lumajang_talks_sample" model="gnext.article">
            <field name="title">Sorotan Komunitas dan Perkembangan Terkini di Lumajang</field>
            <field name="category_id" ref="cat_regional"/>
            <field name="portal">lumajangtalks</field>
            <field name="status">published</field>
            <field name="news_location">Senduro</field>
            <field name="tags">lumajang, wisata, komunitas, lumajangtalks</field>
            <field name="content"><![CDATA[
                <h2>Lumajang Talks: Suara dan Aspirasi Warga</h2>
                <p>Portal kabar dan perbincangan aktual seputar keindahan alam, pariwisata, dan kehidupan sosial di Kabupaten Lumajang.</p>
            ]]></field>
        </record>
    </data>
</odoo>
`);

// 6. i18n
write("i18n/id.po", `# Translation of Odoo Server.
# This file contains the translation of the following modules:
#   * gnext_indonesia
#
msgid ""
msgstr ""
"Project-Id-Version: Odoo Server 17.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2026-09-12 15:00+0000\\n"
"PO-Revision-Date: 2026-09-12 15:00+0000\\n"
"Last-Translator: Gnext Translation Team <info@gnextindonesia.com>\\n"
"Language-Team: Indonesian <id@li.org>\\n"
"Language: id\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

#. module: gnext_indonesia
#: model:ir.module.category,name:gnext_indonesia.module_category_gnext
msgid "Gnext Media"
msgstr "Media Gnext"

#. module: gnext_indonesia
#: model:res.groups,name:gnext_indonesia.group_gnext_penulis
msgid "Penulis Pers"
msgstr "Penulis Pers"

#. module: gnext_indonesia
#: model:res.groups,name:gnext_indonesia.group_gnext_manager
msgid "Manajer Pers"
msgstr "Manajer Pers"

#. module: gnext_indonesia
#: model:res.groups,name:gnext_indonesia.group_gnext_admin
msgid "Administrator"
msgstr "Administrator Utama"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__title
msgid "Judul Artikel"
msgstr "Judul Artikel"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__portal
msgid "Portal Berita"
msgstr "Portal Berita"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__status
msgid "Status"
msgstr "Status Terbit"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__content
msgid "Isi Konten Artikel"
msgstr "Isi Konten Artikel"

#. module: gnext_indonesia
#: model:ir.ui.menu,name:gnext_indonesia.menu_gnext_root
msgid "Gnext Media"
msgstr "Gnext Media"

#. module: gnext_indonesia
#: model:ir.ui.menu,name:gnext_indonesia.menu_gnext_news
msgid "Manajemen Berita"
msgstr "Manajemen Berita"

#. module: gnext_indonesia
#: model:ir.ui.menu,name:gnext_indonesia.menu_gnext_article
msgid "Artikel Berita"
msgstr "Artikel Berita"

#. module: gnext_indonesia
#: model:ir.ui.menu,name:gnext_indonesia.menu_gnext_category
msgid "Kategori"
msgstr "Kategori"
`);

write("i18n/en_US.po", `# Translation of Odoo Server.
# This file contains the translation of the following modules:
#   * gnext_indonesia
#
msgid ""
msgstr ""
"Project-Id-Version: Odoo Server 17.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2026-09-12 15:00+0000\\n"
"PO-Revision-Date: 2026-09-12 15:00+0000\\n"
"Last-Translator: \\n"
"Language-Team: English <en@li.org>\\n"
"Language: en_US\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

#. module: gnext_indonesia
#: model:ir.module.category,name:gnext_indonesia.module_category_gnext
msgid "Gnext Media"
msgstr "Gnext Media"

#. module: gnext_indonesia
#: model:res.groups,name:gnext_indonesia.group_gnext_penulis
msgid "Penulis Pers"
msgstr "Press Writer"

#. module: gnext_indonesia
#: model:res.groups,name:gnext_indonesia.group_gnext_manager
msgid "Manajer Pers"
msgstr "Press Manager"

#. module: gnext_indonesia
#: model:res.groups,name:gnext_indonesia.group_gnext_admin
msgid "Administrator"
msgstr "Administrator"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__title
msgid "Judul Artikel"
msgstr "Article Title"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__portal
msgid "Portal Berita"
msgstr "News Portal"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__status
msgid "Status"
msgstr "Publication Status"

#. module: gnext_indonesia
#: model:ir.model.fields,field_description:gnext_indonesia.field_gnext_article__content
msgid "Isi Konten Artikel"
msgstr "Article Content"
`);

// 7. STATIC ASSETS & APP DESCRIPTION
write("static/description/index.html", `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Gnext Indonesia Odoo Module</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0ea5e9;">Gnext Indonesia - Media &amp; Publishing System</h1>
        <p style="color: #64748b;">Modul terpadu pengelolaan media berita multi-portal untuk Odoo.</p>
    </div>
    <h2>Fitur Unggulan</h2>
    <ul>
        <li><strong>Multi-Portal Publishing:</strong> Kelola Gnext Indonesia, Yoiki Jatim, dan Lumajang Talks dalam satu dashboard Odoo.</li>
        <li><strong>Staf Redaksi &amp; Role Security:</strong> Pembagian hak akses berjenjang (Penulis Pers, Manajer Pers, Administrator).</li>
        <li><strong>Kategori &amp; Hierarki Berita:</strong> Dukungan kategori bersarang (parent-child).</li>
        <li><strong>SEO &amp; Social Graph:</strong> Konfigurasi otomatis tag Open Graph dan Meta Description.</li>
    </ul>
</body>
</html>
`);

// Copy assets
const publicDir = path.join(ROOT_DIR, "public");
const staticImgDir = path.join(OUT_DIR, "static", "src", "img");
copyRecursive(publicDir, staticImgDir);

if (fs.existsSync(path.join(publicDir, "logo.png"))) {
  fs.copyFileSync(path.join(publicDir, "logo.png"), path.join(OUT_DIR, "static", "description", "icon.png"));
} else if (fs.existsSync(path.join(publicDir, "favicon-gnext.png"))) {
  fs.copyFileSync(path.join(publicDir, "favicon-gnext.png"), path.join(OUT_DIR, "static", "description", "icon.png"));
}

import { execSync } from "child_process";

const zipPath = path.join(ROOT_DIR, "odoo_addons", "gnext_indonesia.zip");
try {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execSync(`powershell -Command "Compress-Archive -Path '${OUT_DIR}' -DestinationPath '${zipPath}' -Force"`);
  console.log("📦 ZIP file untuk import Odoo dibuat di:", zipPath);
} catch (e) {
  // fallback if zip command fails
}

console.log("🎉 Berhasil! Modul Odoo siap di:", OUT_DIR);


