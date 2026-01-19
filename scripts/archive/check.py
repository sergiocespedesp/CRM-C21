import re

with open('src/pages/Dashboard.tsx', 'r', encoding='latin-1') as f:
    content = f.read()

print(' Archivo leído correctamente')
print(f'Tamaño: {len(content)} caracteres')

# Verificar que tenemos las secciones
if 'High Priority Leads' in content:
    print(' High Priority encontrado')
if 'Upcoming Actions' in content:
    print(' Upcoming Actions encontrado')
if 'Calendar/Agenda' in content:
    print(' Agenda encontrado')
if 'Recent Activity' in content:
    print(' Activity encontrado')
