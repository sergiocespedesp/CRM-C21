const fs = require('fs');
const packagePath = 'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/package.json';

try {
    let content = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(content);

    // Downgrade recharts
    pkg.dependencies['recharts'] = '^2.13.0';

    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('Downgraded Recharts to 2.13.0');

} catch (err) {
    console.error('Error:', err);
}
