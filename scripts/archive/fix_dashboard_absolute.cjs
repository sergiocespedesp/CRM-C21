const fs = require('fs');

const dashboardPath = 'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/Dashboard.tsx';

try {
    console.log('Reading from:', dashboardPath);
    let content = fs.readFileSync(dashboardPath, 'utf8');

    const lines = content.split('\n');
    let fixedLabel = false;
    let fixedKey = false;

    for (let i = 0; i < lines.length; i++) {
        // Fix Label
        if (lines[i].includes('label={({ name, percent }) =>') && lines[i].includes(' %')) {
            lines[i] = '                    label={({ name, percent }) => ${name} %}';
            fixedLabel = true;
            console.log('Fixed Label at line ' + (i + 1));
        }
        
        // Fix Key
        if (lines[i].includes('<Cell key={cell-')) {
            lines[i] = '                      <Cell key={cell-} fill={COLORS[index % COLORS.length]} />';
            fixedKey = true;
             console.log('Fixed Key at line ' + (i + 1));
        }
    }

    if (fixedLabel || fixedKey) {
        fs.writeFileSync(dashboardPath, lines.join('\n'));
        console.log('File written successfully.');
    } else {
        console.log('Nothing to fix.');
    }

} catch (err) {
    console.error('Error:', err);
}
