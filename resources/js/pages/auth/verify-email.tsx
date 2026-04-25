// Components
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { SharedData } from '@/types';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const { auth } = usePage<SharedData>().props;
    const isSiswa = auth.user?.role === 'siswa';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!isSiswa) {
            post(route('verification.send'));
        }
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col items-center space-y-6 text-center">
                {isSiswa ? (
                    <div className="flex w-full flex-col gap-3">
                        <Button
                            type="button"
                            onClick={() => (window.location.href = route('siswa.dashboard'))}
                            className="w-full"
                        >
                            Ke Dashboard Siswa
                        </Button>
                        <Button disabled variant="outline" type="button" className="w-full">
                            Hubungi Admin untuk Verifikasi
                        </Button>
                    </div>
                ) : (
                    <Button disabled={processing} className="w-full">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Resend verification email
                    </Button>
                )}

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
