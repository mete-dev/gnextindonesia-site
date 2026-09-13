# -*- coding: utf-8 -*-
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
