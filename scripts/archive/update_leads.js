const fs = require('fs');  
const path = 'src/pages/Leads.tsx';  
let content = fs.readFileSync(path, 'utf8');  
console.log('Updating Leads.tsx...');  
