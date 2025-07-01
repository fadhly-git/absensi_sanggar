import { useState } from 'react';
import { Trash2, AlertTriangle, User, Calendar } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type Siswa } from '@/contexts/siswa-context';

interface SiswaDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    siswa: Siswa | null;
    onConfirm: () => void;
}

export function SiswaDeleteDialog({
    open,
    onOpenChange,
    siswa,
    onConfirm,
}: SiswaDeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!siswa) return;

        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Error deleting siswa:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!siswa) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Konfirmasi Penghapusan
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Apakah Anda yakin ingin menghapus data siswa berikut?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <Separator />

                            {/* Siswa Information Card */}
                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{siswa.nama}</span>
                                        </div>

                                        {siswa.alamat && (
                                            <div className="text-sm text-muted-foreground">
                                                <strong>Alamat:</strong> {siswa.alamat}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>Terdaftar: {formatDate(siswa.created_at)}</span>
                                        </div>
                                    </div>

                                    <Badge
                                        variant={siswa.status === 1 ? 'default' : 'secondary'}
                                        className={`${siswa.status === 1
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}
                                    >
                                        {siswa.status === 1 ? 'AKTIF' : 'NON-AKTIF'}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Warning Section */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-red-800">
                                            Peringatan Penting
                                        </h4>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            <li>• Data siswa akan dihapus secara permanen</li>
                                            <li>• Semua riwayat absensi yang terkait akan terpengaruh</li>
                                            <li>• Data yang telah dihapus tidak dapat dipulihkan</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="hover:bg-muted"
                    >
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600 min-w-[100px]"
                    >
                        {isDeleting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Ya, Hapus
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}