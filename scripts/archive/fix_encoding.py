# -*- coding: utf-8 -*-
import os

file_path = r'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/dashboard/components/AgendaView.tsx'

# Leer el archivo COMPLETO original de referencia que SÍ compila
# Voy a usar el archivo que guardamos antes de corromperlo
ref_file = r'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/Leads.tsx'

# Detectar encoding
with open(ref_file, 'rb') as f:
    bytes_data = f.read(3)
    has_bom = (bytes_data == b'\xef\xbb\xbf')

print(f'Using encoding: utf-8-sig' if has_bom else 'Using encoding: utf-8')

# Generar el contenido COMPLETO desde el código que tenemos
# Este es el código completo funcional de AgendaView.tsx
