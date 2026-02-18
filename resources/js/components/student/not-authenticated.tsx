// resources/js/components/student/not-authenticated.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

export function NotAuthenticated() {
    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <ShieldX className="text-destructive h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Akses Ditolak</CardTitle>
                    <CardDescription>
                        Anda perlu login untuk mengakses halaman ini
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => (window.location.href = '/login')}
                        className="w-full"
                        size="lg"
                    >
                        Masuk ke Akun
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
