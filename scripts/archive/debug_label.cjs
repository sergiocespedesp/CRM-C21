const fs = require('fs');
const dashboardPath = 'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/Dashboard.tsx';
const content = fs.readFileSync(dashboardPath, 'utf8');
const index = content.indexOf('label={({ name, percent })');
if (index !== -1) {
    console.log('Found at index:', index);
    console.log('Next 100 chars:');
    console.log(JSON.stringify(content.substring(index, index + 100)));
} else {
    console.log('Not found');
}
