const fs = require('fs');
try {
  let text = fs.readFileSync('src/pages/Leads.tsx', 'utf8');
  text = text.replace('User,', 'User, Users,');
  text = text.replace('await LeadService.createLead({', 'const newLead = await LeadService.createLead({');
  // Use a unique string to identify the end of the call
  text = text.replace('}, formData.message, formData.propertyId);', '}); if(formData.message){ await LeadService.addInteraction({leadId:newLead.id,type:"WHATSAPP",content:formData.message,origin:"MANUAL",advisorId:"adv-1"}); } if(formData.propertyId){ await LeadService.addInterest({id:"int-"+Date.now(),leadId:newLead.id,propertyId:formData.propertyId,date:new Date().toISOString(),status:"ACTIVE",notes:"Initial"}); }');
  fs.writeFileSync('src/pages/Leads.tsx', text);
  console.log('Fixed Leads.tsx');

  let sidebarText = fs.readFileSync('src/components/LeadSidebar.tsx', 'utf8');
  sidebarText = sidebarText.replace('onClick={(e) => {', 'onClick={() => {');
  fs.writeFileSync('src/components/LeadSidebar.tsx', sidebarText);
  console.log('Fixed LeadSidebar.tsx');
} catch (e) {
  console.error(e);
}
