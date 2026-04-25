import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: React.ReactNode;
    value?: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    trailing?: React.ReactNode;
    loading?: boolean;
    iconPosition?: 'left' | 'right';
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    valueClassName?: string;
    subtitleClassName?: string;
    iconWrapperClassName?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    trailing,
    loading = false,
    iconPosition = 'right',
    className,
    contentClassName,
    titleClassName,
    valueClassName,
    subtitleClassName,
    iconWrapperClassName,
}: StatCardProps) {
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-20" />
                </CardContent>
            </Card>
        );
    }

    if (iconPosition === 'left') {
        return (
            <Card className={className}>
                <CardContent className={cn('p-3 sm:p-4', contentClassName)}>
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            {icon && (
                                <div className={cn('p-2 rounded-lg shrink-0', iconWrapperClassName)}>
                                    {icon}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className={cn('text-xs sm:text-sm font-medium text-muted-foreground', titleClassName)}>
                                    {title}
                                </div>
                                <div className={cn('text-lg sm:text-xl font-bold text-foreground', valueClassName)}>
                                    {value}
                                </div>
                                {subtitle && (
                                    <div className={cn('text-xs text-muted-foreground mt-0.5', subtitleClassName)}>
                                        {subtitle}
                                    </div>
                                )}
                            </div>
                        </div>
                        {trailing}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn('text-sm font-medium', titleClassName)}>{title}</CardTitle>
                {icon && <div className={iconWrapperClassName}>{icon}</div>}
            </CardHeader>
            <CardContent className={contentClassName}>
                <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
                {subtitle && <div className={cn('text-xs text-muted-foreground mt-1', subtitleClassName)}>{subtitle}</div>}
                {trailing}
            </CardContent>
        </Card>
    );
}
