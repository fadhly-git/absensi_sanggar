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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import CMSLayout from '@/layouts/cms/cms-layout';
import { Save, Plus, Trash2, Settings as SettingsIcon, Share2, Mail } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { UploadProgressBar } from '@/components/cms/upload-progress-bar';

interface SiteSetting {
  key: string;
  value: string;
  group: string;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  order: number;
}

const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'youtube',
  'twitter',
  'tiktok',
  'whatsapp',
];

export default function SettingsIndex() {
  const queryClient = useQueryClient();
  const { uploadSingle, progress, uploading } = useMediaUpload();

  // Fetch settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/settings/api');
      return response.data.data as SiteSetting[] || [];
    },
  });

  // Fetch social links
  const { data: socialLinks, isLoading: loadingSocial } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/social-links/api');
      return response.data.data as SocialLink[] || [];
    },
  });

  // Local state for settings
  const [generalSettings, setGeneralSettings] = useState({
    site_name: '',
    site_logo: '',
    site_favicon: '',
    year_founded: '2010',
  });

  const [contactSettings, setContactSettings] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    map_embed: '',
  });

  const [seoSettings, setSeoSettings] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  // Load settings into state
  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const getSettingValue = (key: string) =>
        settings.find((s) => s.key === key)?.value || '';

      setGeneralSettings({
        site_name: getSettingValue('site_name'),
        site_logo: getSettingValue('site_logo'),
        site_favicon: getSettingValue('site_favicon'),
        year_founded: getSettingValue('year_founded'),
      });

      setContactSettings({
        email: getSettingValue('contact_email'),
        phone: getSettingValue('contact_phone'),
        whatsapp: getSettingValue('contact_whatsapp'),
        address: getSettingValue('contact_address'),
        map_embed: getSettingValue('contact_map_embed'),
      });

      setSeoSettings({
        meta_title: getSettingValue('seo_meta_title'),
        meta_description: getSettingValue('seo_meta_description'),
        meta_keywords: getSettingValue('seo_meta_keywords'),
      });
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      await axios.put('/atmin/cms/settings/api', data);
    },
    onSuccess: () => {
      toast.success('Pengaturan berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan pengaturan', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Save general settings
  const handleSaveGeneral = () => {
    saveSettingsMutation.mutate({
      site_name: generalSettings.site_name,
      site_logo: generalSettings.site_logo,
      site_favicon: generalSettings.site_favicon,
      year_founded: generalSettings.year_founded,
    });
  };

  // Save contact settings
  const handleSaveContact = () => {
    saveSettingsMutation.mutate({
      contact_email: contactSettings.email,
      contact_phone: contactSettings.phone,
      contact_whatsapp: contactSettings.whatsapp,
      contact_address: contactSettings.address,
      contact_map_embed: contactSettings.map_embed,
    });
  };

  // Save SEO settings
  const handleSaveSEO = () => {
    saveSettingsMutation.mutate({
      seo_meta_title: seoSettings.meta_title,
      seo_meta_description: seoSettings.meta_description,
      seo_meta_keywords: seoSettings.meta_keywords,
    });
  };

  // Handle image upload
  const handleImageUpload = async (file: File, field: string) => {
    try {
      const result = await uploadSingle(file);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Upload failed');
      }
      const imageUrl = result.data.file_url;

      setGeneralSettings((prev) => ({ ...prev, [field]: imageUrl }));
      toast.success('Gambar berhasil diupload');
    } catch (error) {
      toast.error('Gagal upload gambar');
    }
  };

  // Add social link
  const addSocialLinkMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string }) => {
      await axios.post('/atmin/cms/social-links/api', {
        ...data,
        order: (socialLinks?.length || 0) + 1,
      });
    },
    onSuccess: () => {
      toast.success('Social link berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      setNewSocialLink({ platform: '', url: '' });
    },
    onError: (error: any) => {
      toast.error('Gagal menambahkan social link', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Delete social link
  const deleteSocialLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/atmin/cms/social-links/api/${id}`);
    },
    onSuccess: () => {
      toast.success('Social link berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus social link', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });

  const handleAddSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      addSocialLinkMutation.mutate(newSocialLink);
    }
  };

  if (loadingSettings || loadingSocial) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CMSLayout breadcrumbs={[{ title: 'Pengaturan', href: route('atmin.cms.settings.index') }]}>
      <Head title="Pengaturan" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan website dan informasi kontak
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Umum
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="mr-2 h-4 w-4" />
              Kontak
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="mr-2 h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Umum</CardTitle>
                <CardDescription>Informasi dasar website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Nama Website</Label>
                  <Input
                    id="site_name"
                    value={generalSettings.site_name}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, site_name: e.target.value })
                    }
                    placeholder="Ngesti Laras Budaya"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year_founded">Tahun Berdiri</Label>
                  <Input
                    id="year_founded"
                    type="number"
                    value={generalSettings.year_founded}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, year_founded: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo Website</Label>
                  {generalSettings.site_logo && (
                    <img
                      src={generalSettings.site_logo}
                      alt="Site Logo"
                      className="h-20 object-contain mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'site_logo');
                    }}
                  />
                  {uploading && <UploadProgressBar progress={progress} />}
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  {generalSettings.site_favicon && (
                    <img
                      src={generalSettings.site_favicon}
                      alt="Favicon"
                      className="h-8 object-contain mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'site_favicon');
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ukuran recommended: 32x32px atau 64x64px
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSaveGeneral}
              disabled={saveSettingsMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan Umum
            </Button>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
                <CardDescription>
                  Informasi ini akan ditampilkan di halaman kontak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, email: e.target.value })
                    }
                    placeholder="info@ngestilaras.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={contactSettings.phone}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, phone: e.target.value })
                    }
                    placeholder="0291-123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={contactSettings.whatsapp}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, whatsapp: e.target.value })
                    }
                    placeholder="6281234567890"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: 62xxxxxxxxxx (tanpa +, -, atau spasi)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={contactSettings.address}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, address: e.target.value })
                    }
                    rows={3}
                    placeholder="Jl. Contoh No. 123, Meteseh, Boja, Kendal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map_embed">Google Maps Embed</Label>
                  <Textarea
                    id="map_embed"
                    value={contactSettings.map_embed}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, map_embed: e.target.value })
                    }
                    rows={4}
                    placeholder="<iframe src=...></iframe>"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSaveContact}
              disabled={saveSettingsMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Informasi Kontak
            </Button>
          </TabsContent>

          {/* Social Media */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Link akan ditampilkan di footer website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Links */}
                {socialLinks && socialLinks.length > 0 ? (
                  <div className="space-y-2">
                    {socialLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium capitalize">{link.platform}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {link.url}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSocialLinkMutation.mutate(link.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada social media link
                  </p>
                )}

                {/* Add New Link */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Tambah Social Media</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newSocialLink.platform}
                      onValueChange={(value) =>
                        setNewSocialLink({ ...newSocialLink, platform: value })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Pilih platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            <span className="capitalize">{platform}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="URL lengkap"
                      value={newSocialLink.url}
                      onChange={(e) =>
                        setNewSocialLink({ ...newSocialLink, url: e.target.value })
                      }
                    />
                    <Button
                      onClick={handleAddSocialLink}
                      disabled={!newSocialLink.platform || !newSocialLink.url}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimasi untuk mesin pencari Google
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={seoSettings.meta_title}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, meta_title: e.target.value })
                    }
                    placeholder="Ngesti Laras Budaya - Sanggar Seni Budaya Tradisional"
                  />
                  <p className="text-xs text-muted-foreground">Max 60 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={seoSettings.meta_description}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, meta_description: e.target.value })
                    }
                    rows={3}
                    placeholder="Sanggar seni budaya tradisional di Meteseh, Boja, Kendal..."
                  />
                  <p className="text-xs text-muted-foreground">Max 160 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={seoSettings.meta_keywords}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })
                    }
                    placeholder="ngesti laras budaya, ngelaras, meteseh, boja, kendal"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pisahkan dengan koma. Target: ngesti laras budaya, ngelaras, meteseh,
                    boja, kendal
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSaveSEO}
              disabled={saveSettingsMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan SEO
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </CMSLayout>
  );
}
