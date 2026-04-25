import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Mail, Trash2, CheckCheck, Eye, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import CMSLayout from '@/layouts/cms/cms-layout';
import { type BreadcrumbItem } from '@/types';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    replied_at: string | null;
    replier?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pesan Kontak', href: route('atmin.cms.contact-messages.index') },
];


export default function ContactMessagesIndex() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
    const [previewMessage, setPreviewMessage] = useState<ContactMessage | null>(null);
    const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
    const [replyBody, setReplyBody] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['cms-contact-messages', page],
        queryFn: async () => {
            const response = await axios.get('/atmin/cms/contact-messages/api', { params: { page } });
            return response.data as { data: ContactMessage[]; meta: PaginationMeta };
        },
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: number) => {
            await axios.patch(`/atmin/cms/contact-messages/api/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-contact-messages'] });
            toast.success('Pesan berhasil ditandai sebagai dibaca');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error('Gagal menandai pesan sebagai dibaca', {
                description: err.response?.data?.message || err.message,
            });
        },
    });

    const replyMutation = useMutation({
        mutationFn: async (data: { id: number; reply_body: string }) => {
            await axios.post(`/atmin/cms/contact-messages/api/${data.id}/reply`, {
                reply_body: data.reply_body,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-contact-messages'] });
            toast.success('Balasan berhasil dikirim via Email');
            setReplyTarget(null);
            setReplyBody('');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error('Gagal mengirim balasan', {
                description: err.response?.data?.message || err.message,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`/atmin/cms/contact-messages/api/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-contact-messages'] });
            toast.success('Pesan berhasil dihapus');
            setDeleteTarget(null);
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error('Gagal menghapus pesan', {
                description: err.response?.data?.message || err.message,
            });
            setDeleteTarget(null);
        },
    });

    const messages = data?.data || [];
    const meta = data?.meta;

    return (
        <CMSLayout breadcrumbs={breadcrumbs}>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h1 className="text-2xl font-bold">Pesan Kontak</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Pesan masuk dari formulir kontak website
                        </p>
                    </div>
                    {meta && meta.unread_count > 0 && (
                        <Badge variant="destructive" className="text-sm px-3 py-1">
                            {meta.unread_count} belum dibaca
                        </Badge>
                    )}
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : messages.length > 0 ? (
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pengirim</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Pesan</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Tanggal</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {messages.map((msg) => (
                                    <tr
                                        key={msg.id}
                                        className={`hover:bg-muted/30 transition-colors ${!msg.is_read ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {!msg.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{msg.name}</p>
                                                    <p className="text-xs text-muted-foreground">{msg.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="font-medium text-sm mb-0.5">{msg.subject}</p>
                                            <p className="text-muted-foreground line-clamp-2 max-w-xs">{msg.message}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                                            {format(new Date(msg.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {msg.is_read ? (
                                                    <Badge variant="secondary" className="text-xs">Dibaca</Badge>
                                                ) : (
                                                    <Badge variant="default" className="text-xs">Baru</Badge>
                                                )}
                                                {msg.replied_at && (
                                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">Dibalas</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPreviewMessage(msg)}
                                                    title="Lihat pesan"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {!msg.is_read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markReadMutation.mutate(msg.id)}
                                                        disabled={markReadMutation.isPending}
                                                        title="Tandai dibaca"
                                                    >
                                                        <CheckCheck className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReplyTarget(msg)}
                                                    title="Balas via Email"
                                                >
                                                    <Reply className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(msg)}
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Belum ada pesan masuk</p>
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Sebelumnya
                        </Button>
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            {meta.current_page} / {meta.last_page}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>
                            Selanjutnya
                        </Button>
                    </div>
                )}

                {/* Preview Dialog */}
                <AlertDialog open={!!previewMessage} onOpenChange={() => setPreviewMessage(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Pesan dari {previewMessage?.name}</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-3 text-left">
                                    <p className="text-xs text-muted-foreground">
                                        <strong>Email:</strong> {previewMessage?.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        <strong>Subjek:</strong> {previewMessage?.subject}
                                    </p>
                                    {previewMessage?.created_at && (
                                        <p className="text-xs text-muted-foreground">
                                            <strong>Dikirim:</strong>{' '}
                                            {format(new Date(previewMessage.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                    )}
                                    <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                                        {previewMessage?.message}
                                    </div>
                                    {previewMessage?.replied_at && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                <strong>Dibalas pada:</strong> {format(new Date(previewMessage.replied_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                                <br />
                                                <strong>Oleh:</strong> {previewMessage.replier?.name || 'Admin'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            {previewMessage && !previewMessage.is_read && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        markReadMutation.mutate(previewMessage.id);
                                        setPreviewMessage(null);
                                    }}
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" />
                                    Tandai Dibaca
                                </Button>
                            )}
                            <AlertDialogAction onClick={() => setPreviewMessage(null)}>Tutup</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Reply Dialog */}
                <AlertDialog open={!!replyTarget} onOpenChange={(open) => {
                    if (!open) {
                        setReplyTarget(null);
                        setReplyBody('');
                    }
                }}>
                    <AlertDialogContent className="max-w-xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Balas Pesan via Email</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4 text-left mt-2 whitespace-pre-wrap">
                                    <div className="rounded-md bg-muted p-3 text-sm">
                                        <p className="font-medium text-foreground mb-1">
                                            Pesan dari {replyTarget?.name} ({replyTarget?.email}):
                                        </p>
                                        <p className="font-semibold text-foreground mb-1">Subjek: {replyTarget?.subject}</p>
                                        <p className="text-muted-foreground italic line-clamp-3">"{replyTarget?.message}"</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Pesan Balasan</label>
                                        <textarea
                                            className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Ketik balasan email di sini..."
                                            value={replyBody}
                                            onChange={(e) => setReplyBody(e.target.value)}
                                            disabled={replyMutation.isPending}
                                        />
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={replyMutation.isPending}>Batal</AlertDialogCancel>
                            <Button
                                onClick={() => replyTarget && replyMutation.mutate({ id: replyTarget.id, reply_body: replyBody })}
                                disabled={!replyBody.trim() || replyMutation.isPending}
                            >
                                {replyMutation.isPending ? 'Mengirim...' : 'Kirim Balasan'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Delete Confirm Dialog */}
                <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Pesan?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Pesan dari <strong>{deleteTarget?.name}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CMSLayout>
    );
}
