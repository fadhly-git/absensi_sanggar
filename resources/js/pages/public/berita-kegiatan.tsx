import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { ArrowRight, Search, Calendar, User, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import SEOHead from '@/components/seo/seo-head';
import { generateBreadcrumbSchema } from '@/lib/structuredData';
import PublicLayout from '@/layouts/public-layout';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views: number;
  category: { id: number; name: string; slug: string };
  author: { name: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function BeritaKegiatan() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories');
      return response.data.data as Category[];
    },
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['public-posts', search, categoryFilter, page],
    queryFn: async () => {
      const response = await axios.get('/api/posts', {
        params: {
          search,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          page,
          per_page: 9,
          status: 'published',
        },
      });
      return response.data as { data: Post[]; meta: PaginationMeta };
    },
  });

  const posts = postsData?.data || [];
  const meta = postsData?.meta;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Berita & Kegiatan', url: '/news' },
  ]);

  return (
    <PublicLayout>
      <SEOHead structuredData={[breadcrumbSchema]} />

      {/* Header */}
      <section className="relative py-24 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-red-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-background" />
        <div className="absolute inset-0 pattern-grid opacity-15" />

        <div className="relative container mx-auto max-w-7xl px-4 text-center space-y-4 animate-fade-in-up">
          <span className="section-label">
            <Sparkles className="h-3.5 w-3.5" />
            Berita & Kegiatan
          </span>
          <h1 className="text-4xl font-bold text-white lg:text-6xl tracking-tight">
            <span className="golden-text">Kabar Terbaru</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Temukan berita terkini, kegiatan, dan informasi terbaru dari Sanggar Tari Ngesti Laras Budaya
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-16 z-30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berita atau kegiatan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 rounded-xl border-border/50 bg-card/50 focus:border-primary/50"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="rounded-xl border-border/50 bg-card/50">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Posts — Card Grid */}
      <section className="relative py-16 bg-background overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="relative container mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, idx) => (
                  <article
                    key={post.id}
                    className={`group relative rounded-2xl overflow-hidden border border-border/40 bg-card hover-lift animate-fade-in-up delay-${Math.min((idx + 1) * 100, 800)}`}
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
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-primary/60" />
                          {post.author.name}
                        </div>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary/60" />
                          {format(new Date(post.published_at), 'dd MMM yyyy', { locale: id })}
                        </div>
                      </div>

                      <h2 className="text-lg font-bold leading-snug line-clamp-2">
                        <Link
                          href={`/news/${post.slug}`}
                          className="hover:text-primary transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                      </h2>

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

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 mt-14">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl"
                  >
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <span key={p} className="flex items-center">
                            {showEllipsis && <span className="px-2 text-muted-foreground">…</span>}
                            <button
                              onClick={() => setPage(p)}
                              className={`h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 ${p === page
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                : 'hover:bg-accent text-muted-foreground'
                                }`}
                            >
                              {p}
                            </button>
                          </span>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={page === meta.last_page}
                    className="rounded-xl"
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">Tidak ada berita yang ditemukan</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
