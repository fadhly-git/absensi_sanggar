import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Calendar,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import CMSLayout from '@/layouts/cms/cms-layout';
import { LoadingSpinner } from '@/components/atoms/loading-spinner';

interface GalleryImage {
  id: number;
  image_url: string; // If it's a getter on the model
  media?: {
    path: string;
  };
  alt_text: string | null;
  caption: string | null;
  order: number;
}

interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  images: GalleryImage[];
  uploader?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface GalleryIndexProps {
  auth: {
    user: {
      id: number;
      name: string;
      role: string;
    };
  };
}

export default function GalleryIndex({ auth }: GalleryIndexProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('approved');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<GalleryItem | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  // Fetch gallery items
  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ['gallery', activeTab, search],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/gallery/api', {
        params: {
          status: activeTab,
          search,
        },
      });
      return response.data.data as GalleryItem[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/atmin/cms/gallery/api/${id}`);
    },
    onSuccess: () => {
      toast.success('Gallery berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus gallery', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.post(`/atmin/cms/gallery/api/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Gallery berhasil disetujui');
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setApproveId(null);
    },
    onError: (error: any) => {
      toast.error('Gagal menyetujui gallery', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      await axios.post(`/atmin/cms/gallery/api/${id}/reject`, { reason });
    },
    onSuccess: () => {
      toast.success('Gallery ditolak');
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setRejectId(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast.error('Gagal menolak gallery', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Disetujui
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Menunggu
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Ditolak
          </Badge>
        );
    }
  };

  const handleApprove = () => {
    if (approveId) {
      approveMutation.mutate(approveId);
    }
  };

  const handleReject = () => {
    if (rejectId && rejectionReason.trim()) {
      rejectMutation.mutate({ id: rejectId, reason: rejectionReason });
    }
  };

  const isAdmin = auth.user.role === 'admin' || auth.user.role === 'pengurus';

  const getImageUrl = (image: GalleryImage) => {
    if (image.image_url) return image.image_url;
    if (image.media?.path) return `/storage/${image.media.path}`;
    return '';
  };

  return (
    <CMSLayout breadcrumbs={[{ title: 'Gallery', href: route('atmin.cms.gallery.index') }]}>
      <Head title="Gallery" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-muted-foreground">
              Kelola foto-foto kegiatan dan pentas
            </p>
          </div>
          <Link href="/atmin/cms/gallery/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Gallery
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari gallery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="approved">
              <CheckCircle className="mr-2 h-4 w-4" />
              Disetujui
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Menunggu ({galleryItems?.filter((item) => item.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="mr-2 h-4 w-4" />
              Ditolak
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : galleryItems && galleryItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {/* Thumbnail */}
                    <div
                      className="h-48 bg-muted flex items-center justify-center cursor-pointer"
                      onClick={() => setDetailItem(item)}
                    >
                      {item.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.images[0])}
                          alt={item.images[0].alt_text || item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                        {getStatusBadge(item.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {item.description || 'Tidak ada deskripsi'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        {item.images.length} foto
                      </div>
                      {item.event_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(item.event_date), 'dd MMMM yyyy', {
                            locale: id,
                          })}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {item.uploader?.name || 'Unknown'}
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailItem(item)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detail
                      </Button>

                      {isAdmin && item.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => setApproveId(item.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Setujui
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setRejectId(item.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Tolak
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Tidak ada gallery di kategori ini
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailItem?.title}</DialogTitle>
            <DialogDescription>
              {detailItem?.description || 'Tidak ada deskripsi'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-2">
              {detailItem?.images.map((image) => (
                <div key={image.id} className="space-y-2">
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt_text || detailItem.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  {image.caption && (
                    <p className="text-sm text-muted-foreground">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                {detailItem && getStatusBadge(detailItem.status)}
              </div>
              {detailItem?.event_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Event:</span>
                  <span>
                    {format(new Date(detailItem.event_date), 'dd MMMM yyyy', {
                      locale: id,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat oleh:</span>
                <span>{detailItem?.uploader?.name || 'Unknown'}</span>
              </div>
              {detailItem?.status === 'rejected' && detailItem.rejection_reason && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-md">
                  <p className="font-medium text-destructive mb-1">Alasan Penolakan:</p>
                  <p className="text-sm">{detailItem.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Gallery?</AlertDialogTitle>
            <AlertDialogDescription>
              Gallery ini akan ditampilkan di halaman publik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Setujui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Gallery</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan agar pembuat bisa memperbaiki
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Alasan Penolakan</Label>
            <Textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Foto kurang jelas, tidak relevan dengan kegiatan, dll"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Tolak Gallery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gallery?</AlertDialogTitle>
            <AlertDialogDescription>
              Gallery dan semua foto di dalamnya akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
