/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

export function DebugAuth() {
    const [debugData, setDebugData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkAuth = async () => {
        toast.loading('Checking authentication status...');
        setLoading(true);
        try {
            // Test multiple endpoints
            const [sessionCheck, dashboardCheck] = await Promise.allSettled([
                axios.get('/api/check-session'),
                axios.get(route('api.admin.dashboard.summary'))
            ]);

            setDebugData({
                cookies: document.cookie,
                sessionCheck: sessionCheck.status === 'fulfilled' ? sessionCheck.value.data : sessionCheck.reason.response?.data,
                dashboardCheck: dashboardCheck.status === 'fulfilled' ? dashboardCheck.value.data : dashboardCheck.reason.response?.data,
                axiosDefaults: {
                    withCredentials: axios.defaults.withCredentials,
                    headers: axios.defaults.headers.common,
                },
                currentTime: new Date().toISOString(),
                userAgent: navigator.userAgent,
            });
            toast.dismiss();
            toast.success('Debug check completed successfully!');
            setTimeout(() => {
                toast.dismiss();
            }, 2000);
        } catch (error: any) {
            console.error('Debug check failed:', error);
            setDebugData({ error: error.message });
            toast.dismiss();
            toast.error(`Debug check failed: ${error.message}`);
            setTimeout(() => {
                toast.dismiss();
            }, 2000);
        } finally {
            setLoading(false);
            setTimeout(() => {
                toast.dismiss();
            }, 5000);
        }
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg mt-4 dark:bg-gray-800 mx-auto w-full">
            <h3 className="font-bold mb-2">Debug Authentication</h3>

            <Button onClick={checkAuth} disabled={loading} className="mb-4">
                {loading ? 'Checking...' : 'Check Auth Status'}
            </Button>

            {debugData && (
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-96">
                    {JSON.stringify(debugData, null, 2)}
                </pre>
            )}
        </div>
    );
}