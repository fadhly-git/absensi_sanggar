import InputError from '@/components/input-error';
import AppLayout from '@/layouts/student-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Info } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'PIN Login settings',
        href: '/settings/change-pin',
    },
];

export default function ChangePin() {
    const currentPinInput = useRef<HTMLInputElement>(null);
    const newPinInput = useRef<HTMLInputElement>(null);
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_pin: '',
        new_pin: '',
        new_pin_confirmation: '',
    });

    const updatePin: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('settings.pin.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.new_pin) {
                    reset('new_pin', 'new_pin_confirmation');
                    newPinInput.current?.focus();
                }

                if (errors.current_pin) {
                    reset('current_pin');
                    currentPinInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ganti PIN Login" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-start gap-3">
                        <KeyRound className="mt-1 h-5 w-5 text-primary" />
                        <div>
                            <HeadingSmall
                                title="Ganti PIN Login QR"
                                description="Ubah PIN untuk login menggunakan QR Code"
                            />
                        </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                            PIN digunakan untuk login dengan QR Code. Gunakan kombinasi 4-6 digit angka yang mudah diingat namun aman.
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={updatePin} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_pin">PIN Saat Ini</Label>

                            <div className="relative">
                                <Input
                                    id="current_pin"
                                    ref={currentPinInput}
                                    value={data.current_pin}
                                    onChange={(e) => {
                                        // Only allow numeric input
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) {
                                            setData('current_pin', value);
                                        }
                                    }}
                                    type={showCurrentPin ? 'text' : 'password'}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    className="mt-1 block w-full pr-20"
                                    placeholder="Masukkan PIN saat ini"
                                    autoComplete="off"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1/2 right-1 -translate-y-1/2 text-xs"
                                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                                >
                                    {showCurrentPin ? 'Sembunyikan' : 'Tampilkan'}
                                </Button>
                            </div>

                            <InputError message={errors.current_pin} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_pin">PIN Baru</Label>

                            <div className="relative">
                                <Input
                                    id="new_pin"
                                    ref={newPinInput}
                                    value={data.new_pin}
                                    onChange={(e) => {
                                        // Only allow numeric input
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) {
                                            setData('new_pin', value);
                                        }
                                    }}
                                    type={showNewPin ? 'text' : 'password'}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    className="mt-1 block w-full pr-20"
                                    placeholder="4-6 digit angka"
                                    autoComplete="off"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1/2 right-1 -translate-y-1/2 text-xs"
                                    onClick={() => setShowNewPin(!showNewPin)}
                                >
                                    {showNewPin ? 'Sembunyikan' : 'Tampilkan'}
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Minimal 4 digit, maksimal 6 digit (hanya angka 0-9)
                            </p>

                            <InputError message={errors.new_pin} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_pin_confirmation">Konfirmasi PIN Baru</Label>

                            <div className="relative">
                                <Input
                                    id="new_pin_confirmation"
                                    value={data.new_pin_confirmation}
                                    onChange={(e) => {
                                        // Only allow numeric input
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) {
                                            setData('new_pin_confirmation', value);
                                        }
                                    }}
                                    type={showConfirmPin ? 'text' : 'password'}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    className="mt-1 block w-full pr-20"
                                    placeholder="Ketik ulang PIN baru"
                                    autoComplete="off"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1/2 right-1 -translate-y-1/2 text-xs"
                                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                                >
                                    {showConfirmPin ? 'Sembunyikan' : 'Tampilkan'}
                                </Button>
                            </div>

                            <InputError message={errors.new_pin_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} type="submit">
                                {processing ? 'Menyimpan...' : 'Simpan PIN Baru'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    PIN berhasil diubah! ✓
                                </p>
                            </Transition>
                        </div>
                    </form>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <h4 className="mb-2 text-sm font-semibold">Tips Keamanan PIN:</h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>• Jangan gunakan PIN yang mudah ditebak (1234, 0000, dll)</li>
                            <li>• Jangan bagikan PIN Anda kepada siapa pun</li>
                            <li>• Ganti PIN secara berkala untuk keamanan</li>
                            <li>• PIN akan terkunci 15 menit setelah 5x salah input</li>
                        </ul>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
