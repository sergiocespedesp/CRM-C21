import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';
import { useLeads } from '../hooks/useLeads';
import { getOverdueTaskCount } from '../utils/taskUtils';
import {
    LayoutDashboard,
    Users,
    Building2,
    UserCircle,
    Webhook,
    LogOut,
    LayoutGrid,
    BarChart3,
    Settings,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';

const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    // React Query hook
    const { data: leads = [] } = useLeads();
    
    // Calculate overdue count directly from cached data
    const overdueCount = getOverdueTaskCount(leads);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Inicio' },
        { to: '/leads', icon: Users, label: 'Leads' },
        { to: '/kanban', icon: LayoutGrid, label: 'Embudo' },
        { to: '/analytics', icon: BarChart3, label: 'Analíticas' },
        { to: '/automation-settings', icon: Settings, label: 'Automatizaciones' },
        { to: '/inmuebles', icon: Building2, label: 'Inmuebles' },
        { to: '/advisors', icon: UserCircle, label: 'Asesores' },
        { to: '/webhook-simulator', icon: Webhook, label: 'Simulador Webhook' }
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div className="w-full h-full min-h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile Header / Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A1A] z-40 flex items-center px-4 justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <button onClick={toggleSidebar} className="text-white p-2 hover:bg-white/10 rounded-md">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="text-[#BEAF87] font-bold text-lg">CRM C21</span>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationCenter />
                    <div className="w-8 h-8 bg-[#BEAF87] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {(user?.name || '').charAt(0)}
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:static inset-y-0 left-0 z-40
                    bg-[#1A1A1A] border-r border-gray-800 flex flex-col h-full 
                    transition-all duration-300 ease-in-out
                    ${isSidebarCollapsed ? 'w-20' : 'w-64'}
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
                     /* Mobile always full width when open */
                `}
            >
                {/* Logo Desktop */}
                <div className={`p-6 border-b border-gray-800 hidden lg:flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isSidebarCollapsed && (
                        <div>
                            <h1 className="text-2xl font-bold text-[#BEAF87]">CRM C21</h1>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Sistema de Gestión</p>
                        </div>
                    )}
                    <button 
                        onClick={toggleCollapse}
                        className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                        title={isSidebarCollapsed ? "Expandir" : "Colapsar"}
                    >
                        {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                                ${isActive 
                                    ? 'bg-[#BEAF87] text-white shadow-lg shadow-[#BEAF87]/20 font-medium' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                                ${isSidebarCollapsed && !isSidebarOpen ? 'justify-center' : ''}`
                            }
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                    
                                    {(!isSidebarCollapsed || isSidebarOpen) && (
                                        <span className="font-medium truncate">{item.label}</span>
                                    )}

                                    {/* Overdue Badge */}
                                    {item.to === '/' && overdueCount > 0 && (
                                        <span className={`bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                            ${isSidebarCollapsed && !isSidebarOpen ? 'absolute top-2 right-2 translate-x-1/2 -translate-y-1/2' : 'ml-auto'}
                                        `}>
                                            {overdueCount}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info Desktop */}
                <div className="hidden lg:block border-t border-gray-800 bg-black/20">
                     <div className={`p-4 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
                        {!isSidebarCollapsed ? (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#BEAF87] to-[#A89770] rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-[#BEAF87]/20">
                                    {(user?.name || '').charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.role === 'ADMIN' ? 'Administrador' : 'Asesor Inmobiliario'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                             <div className="w-10 h-10 bg-gradient-to-br from-[#BEAF87] to-[#A89770] rounded-full flex items-center justify-center text-white font-bold mb-2 shadow-lg" title={user?.name}>
                                {(user?.name || '').charAt(0)}
                            </div>
                        )}
                        
                        <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center gap-4' : 'justify-between items-center'}`}>
                            <div className={isSidebarCollapsed ? 'contents' : 'flex gap-2'}>
                                <NotificationCenter />
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={logout}
                                className={`text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors
                                    ${isSidebarCollapsed ? 'p-2' : 'flex items-center gap-2 px-2 py-1 text-xs font-medium'}
                                `}
                                title="Cerrar Sesión"
                            >
                                <LogOut size={18} />
                                {!isSidebarCollapsed && <span>Salir</span>}
                            </button>
                        </div>
                    </div>
                </div>
                 {/* Mobile Logout (simple version) */}
                 <div className="lg:hidden p-4 border-t border-gray-800">
                    <button onClick={logout} className="flex items-center gap-3 w-full text-gray-400 hover:text-white p-2">
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                 </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 lg:pt-0 bg-[#F3F4F6] dark:bg-[#0f1115] transition-colors duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
