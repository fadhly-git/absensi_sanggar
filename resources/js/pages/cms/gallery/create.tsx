import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { UploadProgressBar } from '@/components/cms/upload-progress-bar';
import CMSLayout from '@/layouts/cms/cms-layout';
import { DatePicker } from '@/components/molecules/date-picker';

const MAX_IMAGES = 7;

const gallerySchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  description: z.string().optional(),
  event_date: z.string().optional(),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

interface ImageData {
  id?: number;
  image_url: string;
  alt_text: string;
  caption: string;
  order: number;
  mediaId?: number;
}

interface CreateEditGalleryProps {
  galleryId?: string;
}

export default function CreateEditGallery({ galleryId }: CreateEditGalleryProps) {
  const isEdit = !!galleryId;
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
  });

  const { uploadSingle, progress, uploading } = useMediaUpload();

  // Fetch gallery if editing
  const { data: gallery, isLoading: loadingGallery } = useQuery({
    queryKey: ['gallery', galleryId],
    queryFn: async () => {
      if (!galleryId) return null;
      const response = await axios.get(`/atmin/cms/gallery/api/${galleryId}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  // Set form values when gallery data is loaded
  useEffect(() => {
    if (gallery) {
      reset({
        title: gallery.title,
        description: gallery.description || '',
        event_date: gallery.event_date
          ? format(new Date(gallery.event_date), 'yyyy-MM-dd')
          : '',
      });

      setImages(
        gallery.images.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          alt_text: img.alt_text || '',
          caption: img.caption || '',
          order: img.order,
          mediaId: img.media_id,
        }))
      );
    }
  }, [gallery, reset]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Maksimal ${MAX_IMAGES} foto per gallery`);
      return;
    }

    for (const [index, file] of files.entries()) {
      setUploadingIndex(images.length + index);

      try {
        const result = await uploadSingle(file);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Upload failed');
        }

        const mediaId = result.data.id;
        const mediaData = result.data;

        setImages((prev) => [
          ...prev,
          {
            image_url: mediaData.file_url,
            alt_text: '',
            caption: '',
            order: prev.length,
            mediaId,
          },
        ]);
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploadingIndex(null);
      }
    }

    // Reset file input
    e.target.value = '';
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Update image metadata
  const updateImageMeta = (index: number, field: 'alt_text' | 'caption', value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: GalleryFormData) => {
      if (images.length === 0) {
        throw new Error('Minimal 1 foto harus diupload');
      }

      const payload = {
        title: data.title,
        description: data.description || null,
        event_date: data.event_date || null,
        images: images.map((img, idx) => ({
          id: img.id,
          image_url: img.image_url,
          media_id: img.mediaId,
          alt_text: img.alt_text || null,
          caption: img.caption || null,
          order: idx,
        })),
      };

      if (isEdit) {
        const response = await axios.put(
          `/atmin/cms/gallery/api/${galleryId}`,
          payload
        );
        return response.data;
      } else {
        const response = await axios.post('/atmin/cms/gallery/api', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        isEdit ? 'Gallery berhasil diupdate' : 'Gallery berhasil dibuat'
      );
      router.visit('/atmin/cms/gallery');
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan gallery', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const onSubmit = (data: GalleryFormData) => {
    saveMutation.mutate(data);
  };

  if (isEdit && loadingGallery) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CMSLayout
      breadcrumbs={[
        { title: 'Gallery', href: route('atmin.cms.gallery.index') },
        { title: isEdit ? 'Edit Gallery' : 'Tambah Gallery', href: '#' },
      ]}
    >
      <Head title={isEdit ? 'Edit Gallery' : 'Tambah Gallery Baru'} />

      <div className="space-y-6 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/atmin/cms/gallery">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEdit ? 'Edit Gallery' : 'Tambah Gallery Baru'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Ubah detail gallery' : 'Upload foto kegiatan atau pentas'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Gallery</CardTitle>
              <CardDescription>Informasi tentang koleksi foto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Judul Gallery <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Contoh: Pentas Seni Budaya 2025"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detail tentang kegiatan"
                  rows={3}
                />
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="event_date">Tanggal Event (Opsional)</Label>
                <Controller
                  control={control}
                  name="event_date"
                  render={({ field }) => (
                    <DatePicker
                      id="event_date"
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Foto ({images.length}/{MAX_IMAGES})
              </CardTitle>
              <CardDescription>
                Upload maksimal {MAX_IMAGES} foto. Foto akan otomatis dikompresi ke format
                WebP.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Button */}
              {images.length < MAX_IMAGES && (
                <div>
                  <Label htmlFor="image-upload">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Klik untuk upload foto</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: JPG, PNG, WebP (max 5MB per foto)
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Upload Progress */}
              {uploading && uploadingIndex !== null && (
                <UploadProgressBar progress={progress} />
              )}

              {/* Images Grid */}
              {images.length > 0 && (
                <div className="space-y-4">
                  {images.map((image, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-32 h-32 flex-shrink-0">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || `Image ${index + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>

                          {/* Metadata */}
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                              <Label htmlFor={`alt-${index}`}>
                                Alt Text (untuk SEO)
                              </Label>
                              <Input
                                id={`alt-${index}`}
                                value={image.alt_text}
                                onChange={(e) =>
                                  updateImageMeta(index, 'alt_text', e.target.value)
                                }
                                placeholder="Deskripsi singkat foto"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`caption-${index}`}>Caption</Label>
                              <Input
                                id={`caption-${index}`}
                                value={image.caption}
                                onChange={(e) =>
                                  updateImageMeta(index, 'caption', e.target.value)
                                }
                                placeholder="Caption yang akan ditampilkan"
                              />
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {images.length === 0 && !uploading && (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada foto. Upload minimal 1 foto untuk melanjutkan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saveMutation.isPending || images.length === 0}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Update Gallery' : 'Simpan Gallery'}
            </Button>
            <Link href="/atmin/cms/gallery">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
          </div>

          {images.length === 0 && (
            <p className="text-sm text-center text-destructive">
              Minimal 1 foto harus diupload
            </p>
          )}
        </form>
      </div>
    </CMSLayout>
  );
}
