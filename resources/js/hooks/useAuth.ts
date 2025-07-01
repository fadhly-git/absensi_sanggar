import { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface SessionData {
    valid: boolean;
    user?: AuthUser;
    expires_at?: string;
    is_remembered?: boolean;
    login_time?: string;
    current_time?: string;
    message?: string;
}

interface UseAuthReturn {
    user: AuthUser | null;
    isAuthenticated: boolean;
    sessionExpiry: string | null;
    isRemembered: boolean;
    loading: boolean;
    logout: () => void;
    getRemainingTime: () => string;
    getDetailedTimeInfo: () => {
        remaining: string;
        percentage: number;
        isExpiringSoon: boolean;
    };
    checkSession: () => Promise<void>;
    sessionStatus: 'active' | 'warning' | 'expired' | 'unknown';
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [sessionExpiry, setSessionExpiry] = useState<string | null>(null);
    const [isRemembered, setIsRemembered] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await axios.get<SessionData>(route('api.check-session'));
            const data = response.data;

            console.log('Session check response:', data); // Debug logging

            if (data.valid && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                setSessionExpiry(data.expires_at || null);
                setIsRemembered(data.is_remembered || false);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setSessionExpiry(null);
                setIsRemembered(false);
            }
        } catch (error: any) {
            console.error('Session check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            setSessionExpiry(null);
            setIsRemembered(false);

            // Jika unauthorized, redirect ke login
            if (error.response?.status === 401) {
                router.visit('/login');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        router.post('/logout');
    }, []);

    const getRemainingTime = useCallback((): string => {
        if (!sessionExpiry) return 'Unknown';

        try {
            const now = new Date();
            const expiry = new Date(sessionExpiry);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) return 'Expired';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) return `${days}d ${hours}h ${minutes}m`;
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        } catch (error) {
            console.error('Error calculating remaining time:', error);
            return 'Unknown';
        }
    }, [sessionExpiry]);

    const getDetailedTimeInfo = useCallback(() => {
        if (!sessionExpiry) {
            return {
                remaining: 'Unknown',
                percentage: 0,
                isExpiringSoon: false
            };
        }

        try {
            const now = new Date();
            const expiry = new Date(sessionExpiry);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                return {
                    remaining: 'Expired',
                    percentage: 0,
                    isExpiringSoon: true
                };
            }

            // Calculate total session duration based on remember status
            const totalDuration = isRemembered ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
            const elapsed = totalDuration - diff;
            const percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

            // Warning threshold: 30 minutes for 2-hour sessions, 1 day for 7-day sessions
            const warningThreshold = isRemembered ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
            const isExpiringSoon = diff <= warningThreshold;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            let remaining: string;
            if (days > 0) remaining = `${days}d ${hours}h ${minutes}m`;
            else if (hours > 0) remaining = `${hours}h ${minutes}m`;
            else remaining = `${minutes}m`;

            return {
                remaining,
                percentage,
                isExpiringSoon
            };
        } catch (error) {
            console.error('Error calculating detailed time info:', error);
            return {
                remaining: 'Unknown',
                percentage: 0,
                isExpiringSoon: false
            };
        }
    }, [sessionExpiry, isRemembered]);

    const getSessionStatus = useCallback((): 'active' | 'warning' | 'expired' | 'unknown' => {
        if (!sessionExpiry) return 'unknown';

        try {
            const now = new Date();
            const expiry = new Date(sessionExpiry);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) return 'expired';
            
            // Warning jika tersisa kurang dari 30 menit untuk session reguler (2 jam)
            // atau kurang dari 1 hari untuk remember me (7 hari)
            const warningThreshold = isRemembered ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
            
            if (diff <= warningThreshold) return 'warning';
            
            return 'active';
        } catch (error) {
            console.error('Error determining session status:', error);
            return 'unknown';
        }
    }, [sessionExpiry, isRemembered]);

    useEffect(() => {
        checkSession();

        // Check session every 2 minutes untuk session yang lebih pendek
        const interval = setInterval(checkSession, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, [checkSession]);

    return {
        user,
        isAuthenticated,
        sessionExpiry,
        isRemembered,
        loading,
        logout,
        getRemainingTime,
        getDetailedTimeInfo,
        checkSession,
        sessionStatus: getSessionStatus(),
    };
}