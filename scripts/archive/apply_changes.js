const fs = require('fs');  
  
// Backup files  
fs.copyFileSync('src/pages/Leads.tsx', 'src/pages/Leads.tsx.backup');  
fs.copyFileSync('src/pages/dashboard/components/RiskManagement.tsx', 'src/pages/dashboard/components/RiskManagement.tsx.backup');  
fs.copyFileSync('src/pages/Dashboard.tsx', 'src/pages/Dashboard.tsx.backup');  
console.log('Backups created'); 
