import { Link } from '@inertiajs/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Eye, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect } from 'react';
import SEOHead from '@/components/seo/seo-head';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/structuredData';
import PublicLayout from '@/layouts/public-layout';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  video_url: string | null;
  youtube_id: string | null;
  category: { id: number; name: string; slug: string };
  author: { name: string };
}

interface PostDetailProps { slug: string }

export default function PostDetail({ slug }: PostDetailProps) {
  const { data: post, isLoading } = useQuery({
    queryKey: ['public-post', slug],
    queryFn: async () => {
      const response = await axios.get(`/api/posts/${slug}`);
      return response.data.data as Post;
    },
  });

  const incrementViewsMutation = useMutation({
    mutationFn: async (postId: number) => {
      await axios.post(`/api/posts/${postId}/view`);
    },
  });

  useEffect(() => {
    if (post) incrementViewsMutation.mutate(post.id);
  }, [post?.id]);

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.category.id, post?.id],
    queryFn: async () => {
      if (!post) return [];
      const response = await axios.get('/api/posts', {
        params: { category: post.category.slug, exclude: post.id, limit: 3, status: 'published' },
      });
      return response.data.data as Post[];
    },
    enabled: !!post,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading || !post) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PublicLayout>
    );
  }

  const articleSchema = generateArticleSchema({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.featured_image || undefined,
    datePublished: post.published_at,
    author: { name: post.author.name },
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Berita & Kegiatan', url: '/news' },
    { name: post.title, url: `/news/${post.slug}` },
  ]);

  return (
    <PublicLayout>
      <SEOHead
        ogImage={post.featured_image || undefined}
        ogType="article"
        publishedTime={post.published_at}
        author={post.author.name}
        structuredData={[articleSchema, breadcrumbSchema]}
      />

      {/* Hero banner with featured image */}
      {post.featured_image && (
        <section className="relative h-64 md:h-96 w-full overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${post.featured_image})` }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </section>
      )}

      <div className="min-h-screen bg-background">
        {/* Article container */}
        <article className={`container mx-auto max-w-4xl px-4 ${post.featured_image ? '-mt-20 relative z-20' : 'pt-8'}`}>
          {/* Back button */}
          <div className="mb-6">
            <Link href="/news">
              <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Berita
              </Button>
            </Link>
          </div>

          {/* Article card */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-10 shadow-lg animate-fade-in-up">
            <header className="mb-8 space-y-5">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                {post.category.name}
              </Badge>

              <h1 className="text-3xl font-bold leading-tight lg:text-4xl">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary/60" />
                  <span>{format(new Date(post.published_at), 'dd MMMM yyyy', { locale: id })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary/60" />
                  <span>{post.views} views</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto rounded-xl border-border/50 hover:border-primary/30 hover:text-primary"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan
                </Button>
              </div>
            </header>

            {/* Featured image (if no hero banner) */}
            {post.featured_image && !post.featured_image && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img src={post.featured_image} alt={post.title} className="w-full h-auto" />
              </div>
            )}

            {post.youtube_id && (
              <div className="mb-8 aspect-video rounded-xl overflow-hidden border border-border/30">
                <iframe
                  src={`https://www.youtube.com/embed/${post.youtube_id}`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none mb-12 prose-invert prose-golden"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="relative py-20 mt-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background" />
            <div className="absolute inset-0 pattern-dots opacity-10" />
            <div className="golden-divider" />

            <div className="relative container mx-auto max-w-7xl px-4 pt-8">
              <div className="text-center mb-10 space-y-3">
                <span className="section-label">Artikel Lainnya</span>
                <h2 className="text-2xl font-bold">Berita Terkait</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related, idx) => (
                  <Card
                    key={related.id}
                    className={`group overflow-hidden rounded-2xl border-border/40 hover-lift animate-fade-in-up delay-${(idx + 1) * 200}`}
                  >
                    {related.featured_image && (
                      <Link href={`/news/${related.slug}`}>
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={related.featured_image}
                            alt={related.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-semibold line-clamp-2 leading-snug">
                        <Link href={`/news/${related.slug}`} className="hover:text-primary transition-colors">
                          {related.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{related.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 text-primary/60" />
                        {format(new Date(related.published_at), 'dd MMM yyyy', { locale: id })}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
