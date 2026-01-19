const fs = require('fs');
const path = require('path');

const dashboardPath = 'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/Dashboard.tsx';

try {
    console.log('Reading from:', dashboardPath);
    let content = fs.readFileSync(dashboardPath, 'utf8');
    const originalLength = content.length;

    // Fix Label
    // Regex to match: label={({ name, percent }) =>  %}
    // We need to escape special regex chars: { ( ) } $
    const labelRegex = /label={\({\s*name,\s*percent\s*}\) => \ %}/g;
    const labelReplacement = 'label={({ name, percent }) => ${name} %}';
    
    if (labelRegex.test(content)) {
        content = content.replace(labelRegex, labelReplacement);
        console.log('Fixed Label (Regex match)');
    } else {
        console.log('Label Regex did not match');
        // Debug: print the line that looks like it
        const lines = content.split('\n');
        for(const line of lines) {
            if (line.includes('label={({ name, percent })')) {
                console.log('Found similar line:', line.trim());
            }
        }
    }

    // Fix Key
    // Regex to match: <Cell key={cell-}
    const keyRegex = /<Cell key={cell-}/g;
    const keyReplacement = '<Cell key={cell-}';

    if (keyRegex.test(content)) {
        content = content.replace(keyRegex, keyReplacement);
        console.log('Fixed Key (Regex match)');
    } else {
        console.log('Key Regex did not match');
    }

    if (content.length !== originalLength) {
        fs.writeFileSync(dashboardPath, content);
        console.log('File written. Length changed from ' + originalLength + ' to ' + content.length);
    } else {
        console.log('File not written (no changes).');
    }

} catch (err) {
    console.error('Error:', err);
}
