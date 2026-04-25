import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Image, Calendar, Mail, CheckCircle, Clock, Eye } from 'lucide-react';
import CMSLayout from '@/layouts/cms/cms-layout';

interface CMSStats {
  posts: {
    total: number;
    published: number;
    draft: number;
  };
  galleries: {
    total: number;
    approved: number;
    pending: number;
  };
  events: {
    total: number;
    upcoming: number;
  };
  messages: {
    total: number;
    unread: number;
  };
}

export default function CMSDashboard() {
  const { data: stats, isLoading } = useQuery<CMSStats>({
    queryKey: ['cms-stats'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/api/stats');
      return response.data.data;
    },
  });

  const statCards = [
    {
      title: 'Artikel & Berita',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: stats ? [
        { label: 'Total Artikel', value: stats.posts.total },
        { label: 'Published', value: stats.posts.published, icon: CheckCircle },
        { label: 'Draft', value: stats.posts.draft, icon: Clock },
      ] : [],
      href: '/atmin/cms/posts',
    },
    {
      title: 'Gallery',
      icon: Image,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: stats ? [
        { label: 'Total Gallery', value: stats.galleries.total },
        { label: 'Approved', value: stats.galleries.approved, icon: CheckCircle },
        { label: 'Pending', value: stats.galleries.pending, icon: Clock },
      ] : [],
      href: '/atmin/cms/gallery',
    },
    {
      title: 'Events',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: stats ? [
        { label: 'Total Events', value: stats.events.total },
        { label: 'Upcoming', value: stats.events.upcoming, icon: Eye },
      ] : [],
      href: '/atmin/cms/events',
    },
    {
      title: 'Pesan Kontak',
      icon: Mail,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stats: stats ? [
        { label: 'Total Pesan', value: stats.messages.total },
        { label: 'Belum Dibaca', value: stats.messages.unread, icon: Mail },
      ] : [],
      href: '/atmin/cms/contact-messages',
    },
  ];

  return (
    <CMSLayout breadcrumbs={[{ title: 'Dashboard CMS', href: route('atmin.cms.dashboard') }]}>
      <Head title="Dashboard CMS" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard CMS</h1>
          <p className="text-muted-foreground">
            Overview dan statistik konten website
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href}
                  className="group transition-transform hover:scale-105"
                >
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {card.title}
                      </CardTitle>
                      <div className={`rounded-lg p-2 ${card.bgColor}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {card.stats.map((stat, idx) => {
                          const StatIcon = stat.icon;
                          return (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                {StatIcon && <StatIcon className="h-3 w-3" />}
                                <span>{stat.label}</span>
                              </div>
                              <span className="font-semibold">{stat.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Akses cepat ke fitur yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <a
                href="/atmin/cms/posts/create"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Buat Artikel</p>
                  <p className="text-xs text-muted-foreground">Tulis berita baru</p>
                </div>
              </a>
              <a
                href="/atmin/cms/gallery/create"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <Image className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Tambah Gallery</p>
                  <p className="text-xs text-muted-foreground">Upload foto kegiatan</p>
                </div>
              </a>
              <a
                href="/atmin/cms/events/create"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Tambah Event</p>
                  <p className="text-xs text-muted-foreground">Jadwalkan kegiatan</p>
                </div>
              </a>
              <a
                href="/atmin/cms/pages"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <Eye className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Kelola Halaman</p>
                  <p className="text-xs text-muted-foreground">Edit konten halaman</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
