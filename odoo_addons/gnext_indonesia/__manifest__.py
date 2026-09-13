# -*- coding: utf-8 -*-
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
}
