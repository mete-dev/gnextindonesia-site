# -*- coding: utf-8 -*-
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
