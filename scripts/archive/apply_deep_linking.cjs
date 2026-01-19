const fs = require("fs");
console.log("Aplicando cambios para Deep Linking...\n");
// 1. LEADS.TSX
console.log("Modificando Leads.tsx...");
let leadsContent = fs.readFileSync("src/pages/Leads.tsx", "utf8");
leadsContent = leadsContent.replace(
  "import React, { useEffect, useState } from 'react';",
  "import React, { useEffect, useState } from 'react';\nimport { useSearchParams } from 'react-router-dom';"
);
leadsContent = leadsContent.replace(
  "const Leads: React.FC = () => {\n    const [view,",
  "const Leads: React.FC = () => {\n    const [searchParams, setSearchParams] = useSearchParams();\n    const [view,"
);
leadsContent = leadsContent.replace(
  "const [filterAdvisor, setFilterAdvisor] = useState('');",
  "const [filterAdvisor, setFilterAdvisor] = useState('');\n    const [filterTemperature, setFilterTemperature] = useState('');"
);
const urlEffect = "\n    useEffect(() => {\n        const stage = searchParams.get('filter');\n        const temperature = searchParams.get('temperature');\n        const risk = searchParams.get('risk');\n        if (stage) setFilterStage(stage);\n        if (temperature) setFilterTemperature(temperature);\n        if (risk === 'hot-no-action') {\n            setFilterTemperature('HOT');\n        } else if (risk === 'info-sent') {\n            setFilterStage('INFO_SENT');\n        }\n    }, [searchParams]);\n";
leadsContent = leadsContent.replace(
  "    useEffect(() => {\n        loadData();\n    }, []);\n\n    // Close dropdown",
  "    useEffect(() => {\n        loadData();\n    }, []);" + urlEffect + "\n    // Close dropdown"
);
leadsContent = leadsContent.replace(
  "const matchesAdvisor = filterAdvisor ? lead.advisorId === filterAdvisor : true;",
  "const matchesAdvisor = filterAdvisor ? lead.advisorId === filterAdvisor : true;\n        const matchesTemperature = filterTemperature ? lead.temperature === filterTemperature : true;"
);
leadsContent = leadsContent.replace(
  "return matchesSearch && matchesSource && matchesStage && matchesAdvisor && matchesProperty;",
  "return matchesSearch && matchesSource && matchesStage && matchesAdvisor && matchesProperty && matchesTemperature;"
);
const tempUI = '\n                <div className="flex items-center gap-2 border-l border-[var(--border-light)] pl-3">\n                    <Thermometer size={16} className="text-[var(--text-muted)]" />\n                    <select\n                        value={filterTemperature}\n                        onChange={(e) => setFilterTemperature(e.target.value)}\n                        className="text-sm border-none focus:ring-0 text-[var(--text-main)] bg-transparent cursor-pointer max-w-[150px]"\n                    >\n                        <option value="">Todas las Temperaturas</option>\n                        <option value="HOT">Caliente</option>\n                        <option value="WARM">Tibio</option>\n                        <option value="COLD">Frio</option>\n                    </select>\n                </div>\n';
leadsContent = leadsContent.replace(
  '                </div>\r\n\r\n                <div className="flex bg-gray-100 rounded p-1 ml-auto">',
  '                </div>\r\n' + tempUI + '\r\n                <div className="flex bg-gray-100 rounded p-1 ml-auto">'
);
fs.writeFileSync("src/pages/Leads.tsx", leadsContent, "utf8");
console.log("OK Leads.tsx\n");
// 2. RISKMANAGEMENT
console.log("Modificando RiskManagement.tsx...");
let riskContent = fs.readFileSync("src/pages/dashboard/components/RiskManagement.tsx", "utf8");
riskContent = riskContent.replace(
  "onNavigate: (id: string) => void;",
  "onNavigate: (path: string) => void;"
);
riskContent = riskContent.replace(
  "onClick={() => onNavigate(hotLeadsNoAction[0]?.id)}",
  "onClick={() => onNavigate('/leads?risk=hot-no-action')}"
);
riskContent = riskContent.replace(
  "onClick={() => onNavigate('info-sent')}",
  "onClick={() => onNavigate('/leads?risk=info-sent')}"
);
riskContent = riskContent.replace(
  "onClick={() => onNavigate('cooling')}",
  "onClick={() => onNavigate('/leads?risk=inactive')}"
);
fs.writeFileSync("src/pages/dashboard/components/RiskManagement.tsx", riskContent, "utf8");
console.log("OK RiskManagement.tsx\n");
// 3. DASHBOARD
console.log("Modificando Dashboard.tsx...");
let dashContent = fs.readFileSync("src/pages/Dashboard.tsx", "utf8");
dashContent = dashContent.replace(
  /onNavigate=\{[^}]*navigate\([^)]*\)[^}]*\}/,
  "onNavigate={(path) => navigate(path)}"
);
fs.writeFileSync("src/pages/Dashboard.tsx", dashContent, "utf8");
console.log("OK Dashboard.tsx\n");
console.log("Todos los cambios aplicados!");
