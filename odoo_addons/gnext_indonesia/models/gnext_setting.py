# -*- coding: utf-8 -*-
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
