import { useAuth } from '@/hooks/useAuth';
import { Clock, Shield, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SessionStatusProps {
    className?: string;
    showDetails?: boolean;
}

export function SessionStatus({ className, showDetails = false }: SessionStatusProps) {
    const {
        getRemainingTime,
        getDetailedTimeInfo,
        isRemembered,
        sessionStatus,
        logout,
        checkSession,
        sessionExpiry
    } = useAuth();

    const getStatusConfig = () => {
        switch (sessionStatus) {
            case 'active':
                return {
                    icon: Shield,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    text: 'Active',
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    text: 'Expiring Soon',
                };
            case 'expired':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    text: 'Expired',
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    text: 'Unknown',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;
    const remainingTime = getRemainingTime();
    const detailedInfo = getDetailedTimeInfo();

    // Debug info
    // console.log('Session Status Debug:', {
    //     sessionExpiry,
    //     remainingTime,
    //     isRemembered,
    //     sessionStatus,
    //     detailedInfo
    // });

    if (!showDetails) {
        return (
            <div className={cn("flex items-center space-x-2", className)}>
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className={cn("text-sm font-medium", config.color)}>
                    {remainingTime}
                </span>
                {isRemembered && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Extended
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkSession}
                    className="h-6 w-6 p-0"
                >
                    <RefreshCw className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn(
            "rounded-lg border p-4",
            config.bgColor,
            config.borderColor,
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <Icon className={cn("h-5 w-5", config.color)} />
                    <div className="flex-1">
                        <h3 className={cn("font-medium", config.color)}>
                            Session {config.text}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                Type: {isRemembered ? 'Extended (7 days)' : 'Regular (2 hours)'}
                            </p>
                            <p>Remaining: {remainingTime}</p>
                            {sessionExpiry && (
                                <p className="text-xs text-gray-500">
                                    Expires: {new Date(sessionExpiry).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    sessionStatus === 'active' ? 'bg-green-500' :
                                        sessionStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                )}
                                style={{ width: `${100 - detailedInfo.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={checkSession}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    {sessionStatus === 'expired' && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={logout}
                        >
                            Login Again
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}