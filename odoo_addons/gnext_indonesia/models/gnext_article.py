# -*- coding: utf-8 -*-
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
