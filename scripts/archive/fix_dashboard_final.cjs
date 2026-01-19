const fs = require('fs');
const dashboardPath = 'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/Dashboard.tsx';

try {
    let content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Fix Label - String replace
    const badLabel = 'label={({ name, percent }) =>  %}';
    const goodLabel = 'label={({ name, percent }) => ${name} %}';
    
    if (content.includes(badLabel)) {
        content = content.replace(badLabel, goodLabel);
        console.log('Fixed Label');
    } else {
        console.log('Label not found');
    }

    // Fix Key - String replace
    const badKey = '<Cell key={cell-}';
    const goodKey = '<Cell key={cell-}';

    if (content.includes(badKey)) {
        content = content.replace(badKey, goodKey);
        console.log('Fixed Key');
    } else {
        console.log('Key not found');
    }

    fs.writeFileSync(dashboardPath, content);
    console.log('File written.');

} catch (err) {
    console.error('Error:', err);
}
