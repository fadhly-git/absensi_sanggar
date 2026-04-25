import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipTapEditor } from '@/components/cms/tip-tap-editor';
import { MediaUploader } from '@/components/cms/media-uploader';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, LayoutTemplate } from 'lucide-react';
import CMSLayout from '@/layouts/cms/cms-layout';

const postSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Konten harus diisi'),
  featured_image: z.string().min(1, 'Gambar utama harus diupload'),
  category_id: z.string().min(1, 'Kategori harus dipilih'),
  status: z.enum(['draft', 'published']),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  video_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type PostFormData = z.infer<typeof postSchema>;

interface CreateEditPostProps {
  postId?: string;
}

export default function CreateEditPost({ postId }: CreateEditPostProps) {
  const isEdit = !!postId;
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: 'draft',
      content: '',
      title: '',
      excerpt: '',
      featured_image: '',
      category_id: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      video_url: '',
    },
    mode: 'all',
  });

  const watchAllFields = watch();
  const watchContent = watch('content');
  const watchStatus = watch('status');

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/categories/api?all=true');
      return response.data.data || response.data || [];
    },
  });

  // Fetch post if editing
  const { data: post, isLoading: loadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await axios.get(`/atmin/cms/posts/api/${postId}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  // Set form values when post data is loaded
  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        featured_image: post.featured_image,
        category_id: post.category_id.toString(),
        status: post.status,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        video_url: post.video_url || '',
      });
      setSelectedImage(post.featured_image);
    }
  }, [post, reset]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      if (isEdit) {
        const response = await axios.put(`/atmin/cms/posts/api/${postId}`, data);
        return response.data;
      } else {
        const response = await axios.post('/atmin/cms/posts/api', data);
        return response.data;
      }
    },
    onSuccess: (data) => {
      toast.success(isEdit ? 'Artikel berhasil diupdate' : 'Artikel berhasil dibuat');
      router.visit('/atmin/cms/posts');
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan artikel', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    saveMutation.mutate(data);
  };

  const handleImageUpload = (media: any) => {
    setSelectedImage(media.url);
    setValue('featured_image', media.url, { shouldValidate: true });
  };

  const openPreview = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      setIsPreviewOpen(true);
    } else {
      toast.error('Gagal membuka preview. Harap lengkapi semua isian yang diperlukan pada form.');
    }
  };

  const submitFromPreview = () => {
    setIsPreviewOpen(false);
    handleSubmit(onSubmit)();
  };

  if (isEdit && loadingPost) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CMSLayout
      breadcrumbs={[
        { title: 'Artikel', href: route('atmin.cms.posts.index') },
        { title: isEdit ? 'Edit Artikel' : 'Buat Artikel', href: '' },
      ]}
    >
      <Head title={isEdit ? 'Edit Artikel' : 'Buat Artikel Baru'} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/atmin/cms/posts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEdit ? 'Edit Artikel' : 'Buat Artikel Baru'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Ubah artikel yang sudah ada' : 'Tambahkan artikel baru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={openPreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Mode
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Konten Artikel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Judul Artikel <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Masukkan judul artikel"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Ringkasan (Opsional)</Label>
                    <Textarea
                      id="excerpt"
                      {...register('excerpt')}
                      placeholder="Ringkasan singkat artikel"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Akan otomatis diambil dari konten jika tidak diisi
                    </p>
                  </div>

                  {/* Content Editor */}
                  <div className="space-y-2">
                    <Label>
                      Konten <span className="text-destructive">*</span>
                    </Label>
                    <TipTapEditor
                      content={watchContent}
                      onChange={(content) => setValue('content', content, { shouldValidate: true })}
                      placeholder="Tulis konten artikel di sini..."
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive">{errors.content.message}</p>
                    )}
                  </div>

                  {/* Video URL */}
                  <div className="space-y-2">
                    <Label htmlFor="video_url">URL Video YouTube (Opsional)</Label>
                    <Input
                      id="video_url"
                      {...register('video_url')}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {errors.video_url && (
                      <p className="text-sm text-destructive">
                        {errors.video_url.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Video akan ditampilkan di halaman artikel
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta Tags</CardTitle>
                  <CardDescription>
                    Optimalkan artikel untuk mesin pencari
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      {...register('meta_title')}
                      placeholder="Judul untuk SEO (default: judul artikel)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      {...register('meta_description')}
                      placeholder="Deskripsi untuk mesin pencari"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <Input
                      id="meta_keywords"
                      {...register('meta_keywords')}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watchStatus}
                      onValueChange={(value) =>
                        setValue('status', value as 'draft' | 'published')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_id">
                      Kategori <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch('category_id')}
                      onValueChange={(value) => setValue('category_id', value, { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <p className="text-sm text-destructive">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Artikel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Gambar Utama *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedImage && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <img
                        src={selectedImage}
                        alt="Featured"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <MediaUploader
                    onUploadSuccess={handleImageUpload}
                    accept="image/*"
                  />
                  {errors.featured_image && (
                    <p className="text-sm text-destructive">
                      {errors.featured_image.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full p-0 gap-0">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2"><LayoutTemplate className="w-5 h-5" /> Pratinjau Artikel</DialogTitle>
              <DialogDescription>Mempratinjau artikel sebelum menyimpannya.</DialogDescription>
            </div>
          </div>

          <div className="p-0 sm:p-6 lg:p-8 bg-muted/20">
            <div className="bg-background max-w-3xl mx-auto rounded-xl shadow-sm border overflow-hidden">
              {/* Simulated Public Layout Body */}
              {selectedImage && (
                <div className="w-full aspect-[21/9] relative">
                  <img
                    src={selectedImage}
                    alt={watchAllFields.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-10">
                {/* Fake Header Info */}
                <div className="flex gap-2 mb-6 text-sm items-center text-muted-foreground">
                  <span className="font-semibold text-primary">Kategori Terpilih</span>
                  <span>•</span>
                  <span>Baru Saja</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-8 text-foreground pb-6 border-b">
                  {watchAllFields.title || "Judul Artikel Akan Muncul Di Sini"}
                </h1>

                {/* Content Body Render */}
                <div
                  className="prose prose-lg dark:prose-invert max-w-none 
                                prose-headings:font-serif prose-headings:font-bold 
                                prose-p:leading-relaxed prose-a:text-primary 
                                prose-img:rounded-xl prose-img:shadow-md"
                  dangerouslySetInnerHTML={{ __html: watchContent || "<i>Konten artikel masih kosong...</i>" }}
                />
              </div>

            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4 flex justify-between items-center sm:justify-end gap-3 rounded-b-lg">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Kembali Edit</Button>
            <Button onClick={submitFromPreview} disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Simpan Validasi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CMSLayout>
  );
}

