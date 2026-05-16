import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export type User = {
    id: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    checkSession: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return null;
            }

            const { data } = await apiClient.get<User>('/auth/me');
            setUser(data);
            setLoading(false);
            return data;
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
            localStorage.removeItem('access_token');
            setLoading(false);
            return null;
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const signIn = async (token: string) => {
        setLoading(true);
        localStorage.setItem('access_token', token);
        await checkSession();
    };

    const signOut = async () => {
        localStorage.removeItem('access_token');
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
