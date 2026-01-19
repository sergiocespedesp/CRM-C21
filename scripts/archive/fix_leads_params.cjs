const fs = require('fs');  
let content = fs.readFileSync('src/pages/Leads.tsx', 'utf8');  
if (!content.includes('searchParams')) {  
  content = content.replace('const Leads: React.FC = () => {', 'const Leads: React.FC = () => {\\n    const [searchParams] = useSearchParams();');  
  fs.writeFileSync('src/pages/Leads.tsx', content);  
  console.log('Added searchParams');  
} else { console.log('Already exists'); }  
