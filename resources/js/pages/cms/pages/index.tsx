/* eslint-disable @typescript-eslint/no-explicit-any */
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Home, Info, Phone } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { UploadProgressBar } from '@/components/cms/upload-progress-bar';
import CMSLayout from '@/layouts/cms/cms-layout';
import { Checkbox } from '@/components/ui/checkbox';

export default function PagesIndex() {
  const queryClient = useQueryClient();

  // Fetch pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/pages/api');
      return response.data.data || [];
    },
  });

  // Homepage state
  const [homepage, setHomepage] = useState({
    page_title: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    about_title: '',
    about_content: '',
    stats_students: true,
    stats_events: true,
  });

  // About page state
  const [aboutPage, setAboutPage] = useState({
    page_title: '',
    hero_title: '',
    hero_description: '',
    hero_image: '',
    visi: '',
    misi: [] as string[],
    history: '',
  });

  // Contact page state
  const [contactPage, setContactPage] = useState({
    page_title: '',
    title: '',
    subtitle: '',
    address: '',
    map_embed: '',
  });

  const { uploadSingle, progress, uploading } = useMediaUpload();

  // Load page data
  useEffect(() => {
    if (pages) {
      const homePage = pages.find((p: any) => p.page_key === 'homepage');
      const about = pages.find((p: any) => p.page_key === 'about');
      const contact = pages.find((p: any) => p.page_key === 'contact');

      if (homePage?.sections) {
        setHomepage({
          page_title: homePage.title || '',
          hero_title: homePage.sections.hero?.title || '',
          hero_subtitle: homePage.sections.hero?.subtitle || '',
          hero_image: homePage.sections.hero?.image || '',
          about_title: homePage.sections.about?.title || '',
          about_content: homePage.sections.about?.content || '',
          stats_students: homePage.sections.stats?.show_students !== false,
          stats_events: homePage.sections.stats?.show_events !== false,
        });
      }

      if (about?.sections) {
        setAboutPage({
          page_title: about.title || '',
          hero_title: about.sections.hero?.title || '',
          hero_description: about.sections.hero?.description || '',
          hero_image: about.sections.hero?.image || '',
          visi: about.sections.visi || '',
          misi: about.sections.misi || [],
          history: about.sections.history || '',
        });
      }

      if (contact?.sections) {
        setContactPage({
          page_title: contact.title || '',
          title: contact.sections.title || '',
          subtitle: contact.sections.subtitle || '',
          address: contact.sections.address || '',
          map_embed: contact.sections.map_embed || '',
        });
      }
    }
  }, [pages]);

  // Save homepage mutation
  const saveHomepageMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/atmin/cms/pages/api/homepage', {
        title: homepage.page_title,
        sections: {
          hero: {
            title: homepage.hero_title,
            subtitle: homepage.hero_subtitle,
            image: homepage.hero_image,
          },
          about: {
            title: homepage.about_title,
            content: homepage.about_content,
          },
          stats: {
            show_students: homepage.stats_students,
            show_events: homepage.stats_events,
          },
        },
      });
    },
    onSuccess: () => {
      toast.success('Homepage berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error: any) => {
      toast.error('Gagal update homepage', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Save about page mutation
  const saveAboutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/atmin/cms/pages/api/about', {
        title: aboutPage.page_title,
        sections: {
          hero: {
            title: aboutPage.hero_title,
            description: aboutPage.hero_description,
            image: aboutPage.hero_image,
          },
          visi: aboutPage.visi,
          misi: aboutPage.misi,
          history: aboutPage.history,
        },
      });
    },
    onSuccess: () => {
      toast.success('Halaman Tentang Kami berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error: any) => {
      toast.error('Gagal update halaman', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Save contact page mutation
  const saveContactMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/atmin/cms/pages/api/contact', {
        title: contactPage.page_title,
        sections: {
          title: contactPage.title,
          subtitle: contactPage.subtitle,
          address: contactPage.address,
          map_embed: contactPage.map_embed,
        },
      });
    },
    onSuccess: () => {
      toast.success('Halaman Kontak berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error: any) => {
      toast.error('Gagal update halaman', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Handle image upload
  const handleImageUpload = async (
    file: File,
    page: 'homepage' | 'about',
    field: string
  ) => {
    try {
      const result = await uploadSingle(file);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Upload failed');
      }
      const imageUrl = result.data.file_url;

      if (page === 'homepage') {
        setHomepage((prev) => ({ ...prev, [field]: imageUrl }));
      } else if (page === 'about') {
        setAboutPage((prev) => ({ ...prev, [field]: imageUrl }));
      }

      toast.success('Gambar berhasil diupload');
    } catch (error) {
      toast.error('Gagal upload gambar');
      console.error('Image upload error:', error);
    }
  };

  // Add/remove misi
  const addMisi = () => {
    setAboutPage((prev) => ({ ...prev, misi: [...prev.misi, ''] }));
  };

  const removeMisi = (index: number) => {
    setAboutPage((prev) => ({
      ...prev,
      misi: prev.misi.filter((_, i) => i !== index),
    }));
  };

  const updateMisi = (index: number, value: string) => {
    setAboutPage((prev) => ({
      ...prev,
      misi: prev.misi.map((m, i) => (i === index ? value : m)),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CMSLayout breadcrumbs={[{ title: 'Kelola Halaman', href: route('atmin.cms.pages.index') }]}>
      <Head title="Kelola Halaman" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Halaman</h1>
          <p className="text-muted-foreground">
            Ubah konten halaman publik website
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="homepage">
          <TabsList>
            <TabsTrigger value="homepage">
              <Home className="mr-2 h-4 w-4" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="about">
              <Info className="mr-2 h-4 w-4" />
              Tentang Kami
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="mr-2 h-4 w-4" />
              Kontak
            </TabsTrigger>
          </TabsList>

          {/* Homepage */}
          <TabsContent value="homepage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Bagian pertama yang dilihat pengunjung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Judul</Label>
                  <Input
                    id="hero_title"
                    value={homepage.hero_title}
                    onChange={(e) =>
                      setHomepage({ ...homepage, hero_title: e.target.value })
                    }
                    placeholder={homepage.hero_title || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={homepage.hero_subtitle}
                    onChange={(e) =>
                      setHomepage({ ...homepage, hero_subtitle: e.target.value })
                    }
                    placeholder={homepage.hero_subtitle || ""}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  {homepage.hero_image && (
                    <img
                      src={homepage.hero_image}
                      alt="Hero"
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'homepage', 'hero_image');
                    }}
                  />
                  {uploading && <UploadProgressBar progress={progress} />}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Preview Section</CardTitle>
                <CardDescription>Ringkasan tentang sanggar di homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about_title">Judul</Label>
                  <Input
                    id="about_title"
                    value={homepage.about_title}
                    onChange={(e) =>
                      setHomepage({ ...homepage, about_title: e.target.value })
                    }
                    placeholder="Tentang Kami"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about_content">Konten</Label>
                  <Textarea
                    id="about_content"
                    value={homepage.about_content}
                    onChange={(e) =>
                      setHomepage({ ...homepage, about_content: e.target.value })
                    }
                    rows={5}
                    placeholder="Deskripsi singkat tentang sanggar"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
                <CardDescription>
                  Angka yang ditampilkan (dihitung otomatis dari database)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="stats_students"
                    checked={homepage.stats_students}
                    onCheckedChange={(checked) =>
                      setHomepage({ ...homepage, stats_students: checked === true })
                    }
                  />
                  <Label htmlFor="stats_students">Tampilkan Jumlah Siswa Aktif</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="stats_events"
                    checked={homepage.stats_events}
                    onCheckedChange={(checked) =>
                      setHomepage({ ...homepage, stats_events: checked === true })
                    }
                  />
                  <Label htmlFor="stats_events">Tampilkan Total Event</Label>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => saveHomepageMutation.mutate()}
              disabled={saveHomepageMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Homepage
            </Button>
          </TabsContent>

          {/* About Page */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about_hero_title">Judul</Label>
                  <Input
                    id="about_hero_title"
                    value={aboutPage.hero_title}
                    onChange={(e) =>
                      setAboutPage({ ...aboutPage, hero_title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about_hero_description">Deskripsi</Label>
                  <Textarea
                    id="about_hero_description"
                    value={aboutPage.hero_description}
                    onChange={(e) =>
                      setAboutPage({ ...aboutPage, hero_description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  {aboutPage.hero_image && (
                    <img
                      src={aboutPage.hero_image}
                      alt="About Hero"
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'about', 'hero_image');
                    }}
                  />
                  {uploading && <UploadProgressBar progress={progress} />}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visi & Misi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visi">Visi</Label>
                  <Textarea
                    id="visi"
                    value={aboutPage.visi}
                    onChange={(e) =>
                      setAboutPage({ ...aboutPage, visi: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Misi</Label>
                  {aboutPage.misi.map((m, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={m}
                        onChange={(e) => updateMisi(index, e.target.value)}
                        placeholder={`Misi ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMisi(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addMisi}>
                    + Tambah Misi
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sejarah</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={aboutPage.history}
                  onChange={(e) =>
                    setAboutPage({ ...aboutPage, history: e.target.value })
                  }
                  rows={6}
                  placeholder="Ceritakan sejarah sanggar..."
                />
              </CardContent>
            </Card>

            <Button
              onClick={() => saveAboutMutation.mutate()}
              disabled={saveAboutMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Halaman Tentang Kami
            </Button>
          </TabsContent>

          {/* Contact Page */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
                <CardDescription>
                  Email, telepon, dan WhatsApp diambil dari pengaturan umum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_title">Judul</Label>
                  <Input
                    id="contact_title"
                    value={contactPage.title}
                    onChange={(e) =>
                      setContactPage({ ...contactPage, title: e.target.value })
                    }
                    placeholder="Hubungi Kami"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_subtitle">Subtitle</Label>
                  <Textarea
                    id="contact_subtitle"
                    value={contactPage.subtitle}
                    onChange={(e) =>
                      setContactPage({ ...contactPage, subtitle: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={contactPage.address}
                    onChange={(e) =>
                      setContactPage({ ...contactPage, address: e.target.value })
                    }
                    rows={3}
                    placeholder="Alamat lengkap sanggar"
                  />
                </div>
                <div className="space-y-2 max-w-[70vh]">
                  <Label htmlFor="map_embed">Google Maps Embed Code</Label>
                  <Textarea
                    id="map_embed"
                    value={contactPage.map_embed}
                    onChange={(e) =>
                      setContactPage({ ...contactPage, map_embed: e.target.value })
                    }
                    rows={4}
                    placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy paste iframe embed code dari Google Maps
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => saveContactMutation.mutate()}
              disabled={saveContactMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Halaman Kontak
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </CMSLayout>
  );
}
