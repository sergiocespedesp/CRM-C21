const fs = require('fs');
const packagePath = 'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/package.json';

try {
    let content = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(content);

    // Downgrade dependencies
    pkg.dependencies['react'] = '^18.3.1';
    pkg.dependencies['react-dom'] = '^18.3.1';
    
    // Downgrade devDependencies
    pkg.devDependencies['@types/react'] = '^18.3.3';
    pkg.devDependencies['@types/react-dom'] = '^18.3.0';

    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('Downgraded React to 18.x');

} catch (err) {
    console.error('Error:', err);
}
