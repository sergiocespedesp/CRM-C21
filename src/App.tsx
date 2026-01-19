import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import { AuthProvider } from './context/authContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';

// Lazy load all pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Leads = lazy(() => import('./pages/Leads'));
const LeadDetail = lazy(() => import('./pages/LeadDetail'));
const Inmuebles = lazy(() => import('./pages/Inmuebles'));
const Advisors = lazy(() => import('./pages/Advisors'));
const KanbanView = lazy(() => import('./pages/KanbanView'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AutomationSettings = lazy(() => import('./pages/AutomationSettings'));
const WebhookSimulator = lazy(() => import('./pages/WebhookSimulator'));
const UIAudit = lazy(() => import('./pages/UIAudit'));

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <ThemeProvider>
                        <BrowserRouter>
                            <AuthProvider>
                                <Suspense fallback={<LoadingSpinner message="Cargando aplicación..." />}>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/" element={<Layout />}>
                                                <Route index element={<Dashboard />} />
                                                <Route path="leads" element={<Leads />} />
                                                <Route path="leads/:id" element={<LeadDetail />} />
                                                <Route path="kanban" element={<KanbanView />} />
                                                <Route path="analytics" element={<Analytics />} />
                                                <Route path="automation-settings" element={<AutomationSettings />} />
                                                <Route path="inmuebles" element={<Inmuebles />} />
                                                <Route path="advisors" element={<Advisors />} />
                                                <Route path="webhook-simulator" element={<WebhookSimulator />} />
                                                <Route path="ui-audit" element={<UIAudit />} />
                                                <Route path="*" element={<Navigate to="/" replace />} />
                                            </Route>
                                        </Route>
                                    </Routes>
                                </Suspense>
                            </AuthProvider>
                        </BrowserRouter>
                    </ThemeProvider>
                </NotificationProvider>
                <ReactQueryDevtools initialIsOpen={false} />
                <Toaster position="top-right" richColors closeButton />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
