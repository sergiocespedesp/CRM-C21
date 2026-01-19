const fs = require('fs'); 
console.log('Completando Deep Linking...');  
let content = fs.readFileSync('src/pages/Leads.tsx', 'utf8');  
let lines = content.split('\\n');  
let modified = false;  
for (let i = 0; i < lines.length; i++) {  
  if (lines[i].includes('const Leads: React.FC = () => {')) {  
    if (!content.includes('searchParams')) {  
      lines.splice(i + 1, 0, '    const [searchParams] = useSearchParams();');  
      modified = true;  
      console.log('Hook agregado');  
      break;  
    }  
  }  
} 
if (modified) {  
  content = lines.join('\\n');  
  const urlEffect = '    useEffect(() => {\\n        const stage = searchParams.get(\" "filter\);\\n        const temperature = searchParams.get(\temperature\);\\n        const risk = searchParams.get(\risk\);\\n        if (stage) setFilterStage(stage);\\n        if (temperature) setFilterTemperature(temperature);\\n        if (risk === \hot-no-action\) setFilterTemperature(\HOT\);\\n        else if (risk === \info-sent\) setFilterStage(\INFO_SENT\);\\n    }, [searchParams]);\\n';  
  content = content.replace('    }, []);\\r\\n\\r\\n    // Close dropdown', '    }, []);\\n' + urlEffect + '\\n    // Close dropdown');  
  fs.writeFileSync('src/pages/Leads.tsx', content, 'utf8');  
  console.log('Completado!');  
} else { console.log('Ya existe'); } 
