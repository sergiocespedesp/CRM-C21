import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Buscar y extraer cada sección
high_priority_match = re.search(r'({/\* High Priority Leads \*/}.*?</div>\s*</div>)\s*({/\* Upcoming Actions \*/})', content, re.DOTALL)
upcoming_match = re.search(r'({/\* Upcoming Actions \*/}.*?</div>\s*</div>)\s*(</div>)', content, re.DOTALL)
agenda_match = re.search(r'({/\* Calendar/Agenda \*/}.*?</div>\s*</div>)\s*({/\* Recent Activity \*/})', content, re.DOTALL)
activity_match = re.search(r'({/\* Recent Activity \*/}.*?</div>\s*</div>)', content, re.DOTALL)

if all([high_priority_match, upcoming_match, agenda_match, activity_match]):
    high_priority = high_priority_match.group(1)
    upcoming = upcoming_match.group(1)
    agenda = agenda_match.group(1)
    activity = activity_match.group(1)
    
    # Crear nueva estructura
    new_structure = f'''<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {high_priority}

            {agenda}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcoming}

            {activity}
        </div>'''
    
    # Reemplazar todo el bloque
    pattern = r'<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">.*?{/\* Recent Activity \*/}.*?</div>\s*</div>'
    content = re.sub(pattern, new_structure, content, flags=re.DOTALL)
    
    with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(' Reorganización completada')
else:
    print(' No se pudieron encontrar todas las secciones')
