const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');

try {
    let content = fs.readFileSync(dashboardPath, 'utf8');

    // Fix Label
    // Search for the bad line. It has  inside it which might be interpreted as variable in JS if not careful.
    // But here we are in a string.
    const badLabel = 'label={({ name, percent }) =>  %}';
    const goodLabel = 'label={({ name, percent }) => ${name} %}';
    
    if (content.indexOf(badLabel) !== -1) {
        content = content.replace(badLabel, goodLabel);
        console.log('Fixed Label');
    } else {
        console.log('Label not found');
    }

    // Fix Key
    const badKey = '<Cell key={cell-}';
    const goodKey = '<Cell key={cell-}';

    if (content.indexOf(badKey) !== -1) {
        content = content.replace(badKey, goodKey);
        console.log('Fixed Key');
    } else {
        console.log('Key not found');
    }

    fs.writeFileSync(dashboardPath, content);

} catch (err) {
    console.error(err);
}
