import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
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
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  FileText,
  CheckCircle,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import CMSLayout from '@/layouts/cms/cms-layout';

export default function PostsIndex() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', currentPage, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '12', // Adjust per page for grid
      });

      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter && categoryFilter !== 'all') params.append('category_id', categoryFilter);

      const response = await axios.get(`/atmin/cms/posts/api?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/categories/api?all=true');
      return response.data.data || [];
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await axios.delete(`/atmin/cms/posts/api/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Artikel berhasil dihapus');
      setDeletePostId(null);
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus artikel', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Publish/Draft mutations
  const publishMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await axios.patch(`/atmin/cms/posts/api/${postId}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Artikel berhasil dipublish');
    },
    onError: (error: any) => {
      toast.error('Gagal publish artikel', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const draftMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await axios.patch(`/atmin/cms/posts/api/${postId}/draft`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Artikel berhasil dijadikan draft');
    },
    onError: (error: any) => {
      toast.error('Gagal mengubah artikel', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  return (
    <CMSLayout breadcrumbs={[{ title: 'Artikel', href: route('atmin.cms.posts.index') }]}>
      <Head title="Kelola Artikel - CMS" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Artikel & Berita</h1>
            <p className="text-muted-foreground">
              Kelola berita dan kegiatan sanggar
            </p>
          </div>
          <Link href="/atmin/cms/posts/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Artikel
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid Cards Container */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            Loading...
          </div>
        ) : postsData?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border rounded-lg bg-card border-dashed">
            <FileText className="mb-4 h-12 w-12 opacity-50" />
            <p>Belum ada artikel</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {postsData?.data.map((post: any) => (
              <ContextMenu key={post.id}>
                <ContextMenuTrigger className="block h-full group">
                  <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-context-menu relative">
                    <div className="aspect-video w-full bg-muted overflow-hidden relative border-b">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                          <FileText className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-1">
                        {post.status === 'published' ? (
                          <Badge className="bg-green-500 shadow-sm">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shadow-sm">
                            <Clock className="mr-1 h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="flex-1 p-4 space-y-2">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: post.category.color + '10',
                          borderColor: post.category.color + '50',
                          color: post.category.color,
                        }}
                        className="mb-1"
                      >
                        {post.category.name}
                      </Badge>

                      <h3 className="font-semibold text-lg line-clamp-2 leading-snug" title={post.title}>
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center border-t mt-auto">
                      <div className="flex flex-col gap-1 mt-3">
                        <span className="font-medium text-foreground">{post.author.name}</span>
                        <span>
                          {post.published_at
                            ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: localeId })
                            : 'Belum dipublish'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-3" title="Views">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{post.views}</span>
                      </div>
                    </CardFooter>

                    {/* Visual Hint for Context Menu */}
                    <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="bg-background/90 text-foreground px-3 py-1.5 rounded-full shadow-sm text-xs border flex items-center gap-1.5">
                        <MoreVertical className="h-3 w-3" /> Klik Kanan untuk Menu
                      </span>
                    </div>
                  </Card>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-56">
                  {/* Provide direct link preview on the public side if needed, or simply let the editor do it. 
                      You can navigate them directly using router.visit or window.open */}
                  <ContextMenuItem onClick={() => router.visit(`/news/${post.slug}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Buka di Publik
                  </ContextMenuItem>

                  <ContextMenuItem onClick={() => router.visit(`/atmin/cms/posts/${post.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Artikel
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  {post.status === 'draft' ? (
                    <ContextMenuItem
                      onClick={() => publishMutation.mutate(post.id)}
                      disabled={publishMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Publish Artikel
                    </ContextMenuItem>
                  ) : (
                    <ContextMenuItem
                      onClick={() => draftMutation.mutate(post.id)}
                      disabled={draftMutation.isPending}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Jadikan Draft
                    </ContextMenuItem>
                  )}

                  <ContextMenuSeparator />

                  <ContextMenuItem
                    onClick={() => setDeletePostId(post.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Artikel
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}

        {/* Pagination */}
        {postsData && postsData.last_page > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {postsData.from} - {postsData.to} dari {postsData.total}{' '}
              artikel
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === postsData.last_page}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletePostId !== null}
        onOpenChange={() => setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Artikel yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin
              melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && deleteMutation.mutate(deletePostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}

