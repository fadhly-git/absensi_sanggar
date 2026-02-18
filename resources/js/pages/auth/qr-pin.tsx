import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { AlertCircle, KeyRound, Loader2 } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface QrPinProps {
    token: string;
    user: User;
    attemptsLeft?: number;
}

export default function QrPin({ token, user, attemptsLeft }: QrPinProps) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        pin: '',
    });

    const handlePinChange = (pin: string) => {
        setData('pin', pin);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('auth.qr.verify-pin'));
    };

    // Auto-submit when 4-6 digits entered
    useEffect(() => {
        if (data.pin.length >= 4 && data.pin.length <= 6 && !processing) {
            post(route('auth.qr.verify-pin'));
        }
    }, [data.pin]);

    return (
        <>
            <Head title="Login dengan PIN" />

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-3xl font-bold text-white shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <CardTitle className="text-2xl">
                            {user.name}
                        </CardTitle>
                        <CardDescription>
                            <div className="mt-1">{user.email}</div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Masukkan PIN untuk melanjutkan
                            </div>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {errors.pin && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.pin}</AlertDescription>
                            </Alert>
                        )}

                        {errors.token && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {errors.token}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                                    <KeyRound className="h-4 w-4" />
                                    <span>Masukkan PIN Anda</span>
                                </div>

                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={data.pin}
                                        onChange={handlePinChange}
                                        disabled={processing}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <div className="text-center text-xs text-muted-foreground">
                                    PIN akan otomatis terverifikasi setelah
                                    dimasukkan
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || data.pin.length < 4}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>

                            {typeof attemptsLeft === 'number' &&
                                attemptsLeft > 0 &&
                                attemptsLeft < 5 && (
                                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Sisa percobaan: {attemptsLeft}
                                        </p>
                                    </div>
                                )}
                        </form>

                        <div className="border-t pt-4">
                            <div className="text-center text-xs text-muted-foreground">
                                <p>
                                    Scan QR code Anda untuk login dengan aman
                                </p>
                                <p className="mt-1">
                                    Setelah 5x kesalahan, akun akan terkunci 15
                                    menit
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
