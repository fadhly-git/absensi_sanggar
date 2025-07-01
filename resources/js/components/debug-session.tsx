import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function DebugSession() {
    const {
        user,
        isAuthenticated,
        sessionExpiry,
        isRemembered,
        getRemainingTime,
        sessionStatus,
        checkSession
    } = useAuth();

    const debugInfo = {
        user,
        isAuthenticated,
        sessionExpiry,
        isRemembered,
        remainingTime: getRemainingTime(),
        sessionStatus,
        currentTime: new Date().toISOString(),
        browserTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <h3 className="font-bold mb-2">Debug Session Info</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <Button onClick={checkSession} className="mt-2" size="sm">
                Refresh Session
            </Button>
        </div>
    );
}