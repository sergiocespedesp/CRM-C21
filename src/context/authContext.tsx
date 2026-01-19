import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 'ADMIN' | 'ADVISOR';
export interface User {
    id: string;
    username: string; // Matches backend which returns name/email/role etc
    name: string;
    email: string;
    role: UserRole;
    advisorId?: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token and get user info
            api.get('/auth/me')
                .then(response => {
                    const userData = response.data;
                    // Map backend user to frontend User interface if needed
                    // Backend returns { id, name, email, role, ... }
                    setUser({
                        id: userData.id,
                        username: userData.email, // using email as username
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        advisorId: userData.id // Assuming advisor can see their own leads, id is advisorId
                    });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                });
        }
    }, []);

       const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // MOCK LOGIN - Simular autenticación sin backend
            const MOCK_USERS = [
                {
                    id: '1',
                    email: 'admin@c21.com',
                    password: 'admin',
                    name: 'Administrador',
                    role: 'ADMIN' as UserRole
                },
                {
                    id: '2',
                    email: 'asesor@c21.com',
                    password: 'asesor',
                    name: 'Asesor Demo',
                    role: 'ADVISOR' as UserRole
                }
            ];

            // Buscar usuario
            const foundUser = MOCK_USERS.find(
                u => u.email === username && u.password === password
            );

            if (!foundUser) {
                console.error('Usuario o contraseña incorrectos');
                return false;
            }

            // Simular token
            const mockToken = `mock-token-${foundUser.id}-${Date.now()}`;
            localStorage.setItem('token', mockToken);
            
            // Guardar usuario
            setUser({
                id: foundUser.id,
                username: foundUser.email,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
                advisorId: foundUser.id
            });

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
