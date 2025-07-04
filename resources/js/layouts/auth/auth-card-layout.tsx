import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';
import { toast } from 'sonner';

interface ErrorsProps {
    token?: string | string[];
}

interface FlashProps {
    errors?: ErrorsProps;
    message?: string;
}

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    const { props } = usePage();
    const { errors, message } = (props.flash ?? {}) as FlashProps;
    useEffect(() => {
        if (errors?.token) {
            const errorMessage = Array.isArray(errors?.token) ? errors.token.join(', ') : errors?.token;
            toast.error(errorMessage, {
                duration: 5000,
                icon: '❌',
                style: {
                    background: '#f8d7da',
                    color: '#721c24',
                },
            });
        } else if (message) {
            toast.info(message, {
                duration: 5000,
                icon: '🔔',
                style: {
                    background: '#f0f4f8',
                    color: '#333',
                },
            });
        }
    }, [errors?.token, message]);
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-9 w-9 items-center justify-center">
                        <AppLogoIcon className="size-9 fill-current text-black dark:text-white" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
