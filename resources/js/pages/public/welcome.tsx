import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, Users, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import SEOHead from '@/components/seo/seo-head';
import { generateOrganizationSchema, generateLocalBusinessSchema, generateWebSiteSchema } from '@/lib/structuredData';
import PublicLayout from '@/layouts/public-layout';

interface PageSections {
  hero?: { title: string; subtitle: string; image: string };
  about?: { title: string; content: string };
  stats?: { show_students: boolean; show_events: boolean };
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  category: { name: string };
  author: { name: string };
}

interface Stats {
  active_students: number;
  total_events: number;
  year_founded: number;
}

export default function Welcome() {
  const { data: pageData } = useQuery({
    queryKey: ['public-page', 'homepage'],
    queryFn: async () => {
      const response = await axios.get('/api/pages/homepage');
      return response.data.data as { sections: PageSections };
    },
  });

  const { data: posts } = useQuery({
    queryKey: ['public-posts'],
    queryFn: async () => {
      const response = await axios.get('/api/posts', {
        params: { limit: 3, status: 'published' },
      });
      return response.data.data as Post[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/stats');
      return response.data.data as Stats;
    },
  });

  const hero = pageData?.sections?.hero || {
    title: 'Pelestari Seni Tari Tradisional Nusantara',
    subtitle: 'Menjaga Budaya Leluhur Melalui Gerak dan Irama',
    image: '',
  };

  const about = pageData?.sections?.about || { title: 'Tentang Kami', content: '' };

  const structuredData = [
    generateOrganizationSchema(),
    generateLocalBusinessSchema(),
    generateWebSiteSchema(),
  ];

  return (
    <PublicLayout>
      <SEOHead
        ogImage={hero.image || undefined}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center">
        {/* Background */}
        {hero.image ? (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${hero.image})` }}
          />
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-950 via-red-900 to-red-950" />
        )}

        {/* Overlay with gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-background" />

        {/* Decorative elements */}
        <div className="absolute inset-0 z-10 pattern-grid opacity-20" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float z-10" style={{ animationDelay: '2s' }} />

        {/* Content */}
        <div className="relative z-20 w-full px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Label */}
            <div className="animate-fade-in-up">
              <span className="section-label">
                <Sparkles className="h-3.5 w-3.5" />
                Sanggar Tari Tradisional
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight animate-fade-in-up delay-200">
              <span className="golden-text">{hero.title}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/70 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-light animate-fade-in-up delay-400">
              {hero.subtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up delay-600">
              <Button asChild size="lg" className="font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                <Link href="/about-us">Jelajahi Sekarang</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white text-base px-8 py-6 rounded-xl backdrop-blur-sm transition-all duration-300 ">
                <Link href="/news">Lihat Kegiatan</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up delay-800">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs tracking-widest uppercase text-red-950">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-red-950/30 flex justify-center pt-1.5 ">
              <div className="w-1 h-2 rounded-full bg-red-950/50 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      {about.content && (
        <section className="relative py-24 bg-background overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-20" />
          <div className="relative container mx-auto max-w-7xl px-4">
            <div className="max-w-7xl mx-auto text-center space-y-6">
              <span className="section-label">{about.title}</span>
              <h2 className="text-3xl font-bold lg:text-4xl">{about.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed text-justify">
                {about.content.length > 500 ? about.content.substring(0, 500) + '...' : about.content}
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="rounded-xl group">
                  <Link href="/about-us">
                    Lihat Selengkapnya
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {stats && pageData?.sections?.stats && (
        <section className="relative py-20 overflow-hidden">
          {/* Golden gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary to-primary/90" />
          <div className="absolute inset-0 pattern-grid opacity-10" />

          <div className="relative container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {pageData.sections.stats.show_students && (
                <div className="space-y-3 animate-fade-in-up">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                    <Users className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <p className="text-5xl font-extrabold text-primary-foreground md:text-6xl">{stats.active_students}</p>
                  <p className="text-base font-semibold text-primary-foreground/80 tracking-wide">Siswa Aktif</p>
                </div>
              )}
              {pageData.sections.stats.show_events && (
                <div className="space-y-3 animate-fade-in-up delay-200">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                    <CalendarDays className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <p className="text-5xl font-extrabold text-primary-foreground md:text-6xl">{stats.total_events}</p>
                  <p className="text-base font-semibold text-primary-foreground/80 tracking-wide">Total Event</p>
                </div>
              )}
              <div className="space-y-3 animate-fade-in-up delay-400">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                  <TrendingUp className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="text-5xl font-extrabold text-primary-foreground md:text-6xl">{new Date().getFullYear() - stats.year_founded}+</p>
                <p className="text-base font-semibold text-primary-foreground/80 tracking-wide">Tahun Berpengalaman</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts — Card Grid */}
      {posts && posts.length > 0 && (
        <section className="relative py-24 bg-background overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-15" />
          <div className="relative container mx-auto max-w-7xl px-4">
            <div className="text-center mb-14 space-y-4">
              <span className="section-label">Berita & Kegiatan</span>
              <h2 className="text-3xl font-bold lg:text-4xl">Kabar Terbaru</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Ikuti perkembangan dan kegiatan terbaru dari Sanggar Tari Ngesti Laras Budaya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <article
                  key={post.id}
                  className={`group relative rounded-2xl overflow-hidden border border-border/40 bg-card hover-lift animate-fade-in-up delay-${(idx + 1) * 200}`}
                >
                  {/* Image */}
                  <Link href={`/news/${post.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Tidak ada gambar</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/90 text-primary-foreground backdrop-blur-sm">
                          {post.category.name}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{post.author.name}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      <span>{format(new Date(post.published_at), 'dd MMM yyyy', { locale: id })}</span>
                    </div>

                    <h3 className="text-lg font-bold leading-snug line-clamp-2">
                      <Link
                        href={`/news/${post.slug}`}
                        className="hover:text-primary transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/news/${post.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-primary hover:underline group/link"
                    >
                      Baca selengkapnya
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-14">
              <Button asChild size="lg" variant="outline" className="rounded-xl group">
                <Link href="/news">
                  Lihat Semua Berita
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
