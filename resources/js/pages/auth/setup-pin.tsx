import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
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
import {
    AlertCircle,
    CheckCircle2,
    KeyRound,
    Loader2,
    ShieldCheck,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface SetupPinProps {
    token: string;
    user: User;
}

export default function SetupPin({ token, user }: SetupPinProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        pin: '',
        pin_confirmation: '',
    });

    const handlePinChange = (pin: string) => {
        setData('pin', pin);
    };

    const handleConfirmationChange = (pin: string) => {
        setData('pin_confirmation', pin);
    };

    const handleContinue = () => {
        if (data.pin.length >= 4 && data.pin.length <= 6) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setData('pin_confirmation', '');
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (data.pin !== data.pin_confirmation) {
            return;
        }

        post(route('auth.qr.setup-pin'), {
            onError: () => {
                // Reset confirmation on error
                setData('pin_confirmation', '');
                setStep(1);
            },
        });
    };

    const pinsMatch =
        data.pin.length >= 4 && data.pin === data.pin_confirmation;
    const isPinValid =
        data.pin.length >= 4 && data.pin.length <= 6 && /^\d+$/.test(data.pin);

    return (
        <>
            <Head title="Setup PIN" />

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Setup PIN</CardTitle>
                        <CardDescription>
                            Buat PIN untuk login dengan QR code
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="rounded-lg border bg-muted/50 p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <p className="font-semibold">{user.name}</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>

                        {/* Requirements */}
                        <Alert>
                            <AlertDescription>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                        <span>
                                            PIN minimal 4 digit, maksimal 6
                                            digit
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                        <span>Hanya angka (0-9)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                        <span>
                                            PIN bersifat permanen
                                        </span>
                                    </li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        {/* Errors */}
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
                            {/* Step 1: Enter PIN */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                                        <KeyRound className="h-4 w-4" />
                                        <span>PIN Baru</span>
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

                                    {data.pin.length > 0 && (
                                        <div className="text-center text-sm">
                                            {isPinValid ? (
                                                <span className="text-green-600">
                                                    ✓ PIN valid
                                                </span>
                                            ) : (
                                                <span className="text-red-600">
                                                    {data.pin.length < 4
                                                        ? '✗ Minimal 4 digit'
                                                        : '✗ Hanya angka 0-9'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        className="w-full"
                                        onClick={handleContinue}
                                        disabled={!isPinValid}
                                    >
                                        Lanjutkan
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Confirm PIN */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                                        <KeyRound className="h-4 w-4" />
                                        <span>Konfirmasi PIN</span>
                                    </div>

                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            value={data.pin_confirmation}
                                            onChange={handleConfirmationChange}
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

                                    {data.pin_confirmation.length > 0 && (
                                        <div className="text-center text-sm">
                                            {pinsMatch ? (
                                                <span className="text-green-600">
                                                    ✓ PIN cocok
                                                </span>
                                            ) : (
                                                <span className="text-red-600">
                                                    ✗ PIN tidak cocok
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleBack}
                                            disabled={processing}
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing || !pinsMatch}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Buat PIN'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`}
                            />
                            <div
                                className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted'}`}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <div className="text-center text-xs text-muted-foreground">
                                <p>
                                    PIN ini akan digunakan untuk login via QR
                                    code
                                </p>
                                <p className="mt-1">
                                    Simpan PIN Anda dengan aman dan jangan
                                    bagikan
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
