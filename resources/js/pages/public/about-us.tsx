import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Quote, BookOpen, Target } from 'lucide-react';
import SEOHead from '@/components/seo/seo-head';
import { generateBreadcrumbSchema } from '@/lib/structuredData';
import PublicLayout from '@/layouts/public-layout';
import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface MisiItem {
  icon?: string;
  title?: string;
  description: string;
}

interface PageSections {
  hero?: { title: string; description: string; image: string };
  visi?: string;
  misi?: (string | MisiItem)[];
  history?: string;
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (!Icon) return <CheckCircle className={className} />;
  return <Icon className={className} />;
}

export default function AboutUs() {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['public-page', 'about'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/pages/about');
        return response.data.data as { sections: PageSections };
      } catch {
        return null;
      }
    },
  });

  const hero = pageData?.sections?.hero || { title: 'Tentang Kami', description: '', image: '' };
  const visi = pageData?.sections?.visi || '';
  const misi = pageData?.sections?.misi || [];
  const history = pageData?.sections?.history || '';

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Tentang Kami', url: '/about-us' },
  ]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEOHead
        ogImage={hero.image || undefined}
        structuredData={[breadcrumbSchema]}
      />

      {/* ===== HERO ===== */}
      <section className="relative h-72 w-full overflow-hidden lg:h-[420px] flex items-center">
        {hero.image ? (
          <div className="absolute inset-0 z-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${hero.image})` }} />
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-950 via-red-900 to-red-950" />
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute inset-0 z-10 pattern-grid opacity-15" />
        {/* Decorative floating orbs */}
        <div className="absolute top-10 left-20 w-48 h-48 rounded-full bg-primary/8 blur-3xl animate-float z-10" />
        <div className="absolute bottom-10 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float z-10" style={{ animationDelay: '2s' }} />

        <div className="relative z-20 w-full px-4 text-center">
          <div className="space-y-5 animate-fade-in-up">
            <span className="section-label">
              <Sparkles className="h-3.5 w-3.5" />
              Siapa Kami
            </span>
            <h1 className="text-4xl font-extrabold text-white lg:text-6xl tracking-tight">
              <span className="golden-text">{hero.title}</span>
            </h1>
            {hero.description && (
              <p className="text-white/60 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">{hero.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== TENTANG KAMI / ABOUT DESCRIPTION ===== */}
      {/* This section renders only if there's content from API that's not the history */}
      {/* The "Tentang Kami" body text from the screenshot comes from here */}

      {/* ===== SEJARAH BERDIRI ===== */}
      {history && (
        <section className="relative py-20 lg:py-28 bg-background overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-15" />
          <div className="relative container mx-auto max-w-7xl px-4">
            <div className="grid lg:grid-cols-[300px_1fr] gap-12 lg:gap-16 items-start">
              {/* Left: section heading */}
              <div className="lg:sticky lg:top-24 space-y-4">
                <span className="section-label">Perjalanan Kami</span>
                <h2 className="text-3xl font-bold lg:text-4xl leading-tight">
                  Sejarah<br />
                  <span className="golden-text">Berdiri</span>
                </h2>
                <div className="hidden lg:block">
                  <div className="h-24 w-px bg-gradient-to-b from-primary/60 to-transparent mt-4" />
                </div>
                <div className="hidden lg:flex items-center gap-3 text-sm text-muted-foreground pt-2">
                  <BookOpen className="h-4 w-4 text-primary/60" />
                  <span>Kisah pendirian sanggar</span>
                </div>
              </div>

              {/* Right: content */}
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden lg:block" />
                <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-8 lg:p-10">
                  <div className="prose prose-lg max-w-none text-justify text-muted-foreground whitespace-pre-line leading-[1.85]">
                    {history}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== VISI & MISI ===== */}
      {(visi || misi.length > 0) && (
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/10" />
          <div className="absolute inset-0 pattern-grid opacity-8" />

          <div className="relative container mx-auto max-w-7xl px-4">
            {/* Section Header */}
            <div className="text-center mb-16 space-y-4">
              <span className="section-label">Arah & Tujuan</span>
              <h2 className="text-3xl font-bold lg:text-5xl tracking-tight">
                Visi <span className="golden-text">&</span> Misi
              </h2>
              <div className="golden-divider mx-auto max-w-[120px] mt-4" />
            </div>

            {/* Visi */}
            {visi && (
              <div className="max-w-4xl mx-auto mb-20 animate-fade-in-up">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest">
                    <Target className="h-4 w-4" />
                    Visi
                  </div>
                </div>
                <div className="relative rounded-2xl border border-primary/15 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm p-10 lg:p-12">
                  {/* Decorative quote marks */}
                  <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/15 rotate-180" />
                  <Quote className="absolute bottom-6 right-6 h-8 w-8 text-primary/15" />
                  <p className="text-center text-lg lg:text-xl text-foreground/90 leading-relaxed whitespace-pre-line italic font-medium">
                    &ldquo;{visi}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Misi */}
            {misi.length > 0 && (
              <div className="animate-fade-in-up delay-200">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" />
                    Misi
                  </div>
                </div>

                {typeof misi[0] === 'object' ? (
                  /* Card grid for structured misi items — 3 columns */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(misi as MisiItem[]).map((item, i) => (
                      <div
                        key={i}
                        className={`group relative flex flex-col items-center text-center gap-4 p-7 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm hover-lift hover:border-primary/25 transition-all duration-300 animate-fade-in-up delay-${Math.min((i + 1) * 100, 800)}`}
                      >
                        {/* Icon */}
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/10 group-hover:ring-primary/25 group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300">
                          <DynamicIcon name={item.icon || 'CheckCircle'} className="h-6 w-6 text-primary" />
                        </div>

                        {/* Title */}
                        {item.title && (
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-200">
                            {item.title}
                          </h4>
                        )}

                        {/* Description */}
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {item.description}
                        </p>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-3/4 transition-all duration-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List for string-based misi items */
                  <div className="max-w-3xl mx-auto space-y-4">
                    {(misi as string[]).map((item, i) => (
                      <div
                        key={i}
                        className={`group flex gap-4 p-5 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm hover:border-primary/20 hover-lift transition-all duration-300 animate-fade-in-up delay-${Math.min((i + 1) * 100, 800)}`}
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors duration-200">
                          <span className="text-sm font-bold">{i + 1}</span>
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary to-primary/85" />
        <div className="absolute inset-0 pattern-dots opacity-10" />
        {/* Decorative */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
            Bergabunglah Bersama Kami
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Mari bersama-sama melestarikan dan mengembangkan seni budaya tradisional Indonesia
          </p>
          <div className="pt-3">
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-xl text-base px-10 py-6 font-semibold backdrop-blur-sm">
              <Link href="/contact">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
