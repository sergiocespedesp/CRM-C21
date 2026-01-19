import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');

const content = \import React from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Building2, 
  ArrowUpRight, 
  Clock,
  MoreHorizontal,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { mockLeads, mockInteractions } from '../services/mockData';

const Dashboard: React.FC = () => {
  // Mock calculations
  const totalLeads = mockLeads.length;
  const newLeads = mockLeads.filter(l => l.stage === 'NEW').length;
  const interactionsToday = 5; // Mock
  const activeProjects = 3;

  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
  ];

  const leadStageData = [
    { name: 'New', value: mockLeads.filter(l => l.stage === 'NEW').length },
    { name: 'Contacted', value: mockLeads.filter(l => l.stage === 'CONTACTED').length },
    { name: 'Qualified', value: mockLeads.filter(l => l.stage === 'QUALIFIED').length },
    { name: 'Closed', value: mockLeads.filter(l => l.stage === 'CLOSED_WON').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const stats = [
    { 
      label: 'Active Clients', 
      value: totalLeads, 
      icon: Users,
      color: 'bg-[#00a65a]', // Success Green
      iconBg: 'bg-black/10'
    },
    { 
      label: 'New Leads', 
      value: newLeads, 
      icon: TrendingUp,
      color: 'bg-[#00c0ef]', // Aqua
      iconBg: 'bg-black/10'
    },
    { 
      label: 'Interactions', 
      value: interactionsToday, 
      icon: MessageSquare,
      color: 'bg-[#f39c12]', // Orange
      iconBg: 'bg-black/10'
    },
    { 
      label: 'Projects', 
      value: activeProjects, 
      icon: Building2,
      color: 'bg-[#dd4b39]', // Red
      iconBg: 'bg-black/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={\ounded-[3px] shadow-sm text-white overflow-hidden relative \\}>
              <div className="p-4 flex justify-between items-center relative z-10">
                <div>
                  <h3 className="text-4xl font-bold">{\}</h3>
                  <p className="text-sm font-medium uppercase opacity-80 mt-1">{\}</p>
                </div>
                <Icon size={48} className="opacity-20 absolute right-4 top-4" />
              </div>
              <div className="bg-black/10 px-4 py-1 text-xs text-center flex justify-center items-center gap-1 cursor-pointer hover:bg-black/20 transition-colors">
                More info <ArrowUpRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="card card-primary">
          <div className="card-header">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock size={18} className="text-[var(--text-muted)]" />
              Recent Activity
            </h3>
            <div className="flex gap-1">
               <button className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"><MoreHorizontal size={16} /></button>
            </div>
          </div>
          
          <div className="card-body p-0">
            <div className="divide-y divide-[var(--border-light)]">
              {mockInteractions.slice(0, 5).map((interaction) => (
                <div key={interaction.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--color-secondary)]">
                      <MessageSquare size={14} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-[var(--color-secondary)] hover:underline cursor-pointer">
                        Lead {interaction.leadId}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(interaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-main)] mb-2">
                      {interaction.content}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      {interaction.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-[var(--border-light)] text-center">
            <button className="text-sm text-[var(--color-secondary)] font-medium hover:underline">View All Activity</button>
          </div>
        </div>

        {/* Tasks / To-Do List */}
        <div className="card card-success">
          <div className="card-header">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckSquare size={18} className="text-[var(--text-muted)]" />
              Pending Tasks
            </h3>
            <div className="flex gap-2">
              <span className="text-xs bg-[var(--color-warning)] text-white px-2 py-0.5 rounded">3 Pending</span>
            </div>
          </div>
          
          <div className="card-body p-0">
             <ul className="divide-y divide-[var(--border-light)]">
              {[
                { id: 1, text: 'Follow up with new leads from Facebook', time: '2 mins', status: 'urgent' },
                { id: 2, text: 'Prepare monthly sales report', time: '4 hours', status: 'normal' },
                { id: 3, text: 'Update project pricing for "Torres del Sol"', time: '1 day', status: 'normal' },
                { id: 4, text: 'Meeting with sales team', time: '2 days', status: 'done' },
              ].map((task) => (
                <li key={task.id} className="p-3 flex items-center gap-3 hover:bg-[var(--bg-card-hover)] group">
                  <input type="checkbox" defaultChecked={task.status === 'done'} className="cursor-pointer" />
                  <span className={\lex-1 text-sm \\}>
                    {task.text}
                  </span>
                  <span className={\	ext-xs px-2 py-0.5 rounded text-white \\}>
                    {task.time}
                  </span>
                </li>
              ))}
             </ul>
          </div>
          <div className="p-3 border-t border-[var(--border-light)] flex justify-between items-center">
            <button className="btn btn-sm btn-ghost text-xs uppercase font-bold text-[var(--text-muted)]">
              <Plus size={14} className="inline mr-1" /> Add Item
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-info">
           <div className="card-header">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--text-muted)]" />
                Monthly Sales Performance
              </h3>
           </div>
           <div className="card-body h-80 bg-[var(--bg-card)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#00c0ef" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="card card-warning">
           <div className="card-header">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users size={18} className="text-[var(--text-muted)]" />
                Leads by Stage
              </h3>
           </div>
           <div className="card-body h-80 bg-[var(--bg-card)]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadStageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => \\ \%\}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadStageData.map((entry, index) => (
                      <Cell key={\cell-\\} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

function Plus({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export default Dashboard;\;

try {
    fs.writeFileSync(dashboardPath, content);
    console.log('Overwritten Dashboard.tsx');
} catch (err) {
    console.error('Error:', err);
}
