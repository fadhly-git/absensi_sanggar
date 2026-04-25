import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import SEOHead from '@/components/seo/seo-head';
import { generateBreadcrumbSchema } from '@/lib/structuredData';
import PublicLayout from '@/layouts/public-layout';

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
}

interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null;
  images: GalleryImage[];
}

export default function Gallery() {
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: async () => {
      const response = await axios.get('/api/gallery', { params: { status: 'approved' } });
      return response.data.data as GalleryItem[];
    },
  });

  const openLightbox = (item: GalleryItem, index = 0) => {
    setLightboxItem(item);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxItem(null);

  const prevImage = () => {
    if (!lightboxItem) return;
    setLightboxIndex((i) => (i - 1 + lightboxItem.images.length) % lightboxItem.images.length);
  };

  const nextImage = () => {
    if (!lightboxItem) return;
    setLightboxIndex((i) => (i + 1) % lightboxItem.images.length);
  };

  const scrollCarousel = (id: number, dir: 'left' | 'right') => {
    const el = scrollRefs.current[id];
    if (el) el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Gallery', url: '/gallery' },
  ]);

  return (
    <PublicLayout>
      <SEOHead structuredData={[breadcrumbSchema]} />

      {/* Header */}
      <section className="relative py-24 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 to-background" />
        <div className="absolute inset-0 pattern-grid opacity-15" />

        <div className="relative container mx-auto max-w-7xl px-4 text-center space-y-4 animate-fade-in-up">
          <span className="section-label">
            <Sparkles className="h-3.5 w-3.5" />
            Dokumentasi
          </span>
          <h1 className="text-4xl font-bold text-white lg:text-6xl tracking-tight">
            <span className="golden-text">Galeri</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Dokumentasi kegiatan dan pentas Sanggar Tari Ngesti Laras Budaya
          </p>
        </div>
      </section>

      {/* Gallery Albums */}
      <section className="relative py-20 bg-background overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="relative container mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="space-y-20">
              {galleries.map((gallery, gIdx) => (
                <div key={gallery.id} className={`animate-fade-in-up delay-${Math.min(gIdx * 200, 600)}`}>
                  {/* Album Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
                        <h2 className="text-2xl font-bold lg:text-3xl">{gallery.title}</h2>
                      </div>
                      {gallery.description && (
                        <p className="text-muted-foreground text-sm max-w-xl ml-4 pl-3">{gallery.description}</p>
                      )}
                      {gallery.event_date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-4 pl-3">
                          <Calendar className="h-3.5 w-3.5 text-primary/60" />
                          {format(new Date(gallery.event_date), 'dd MMMM yyyy', { locale: id })}
                        </div>
                      )}
                    </div>
                    {/* Scroll buttons */}
                    {gallery.images.length > 3 && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => scrollCarousel(gallery.id, 'left')}
                          className="h-10 w-10 rounded-xl border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => scrollCarousel(gallery.id, 'right')}
                          className="h-10 w-10 rounded-xl border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Carousel */}
                  {gallery.images.length > 0 ? (
                    <div
                      ref={(el) => { scrollRefs.current[gallery.id] = el; }}
                      className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
                    >
                      {gallery.images.map((image, idx) => (
                        <div
                          key={image.id}
                          className="group flex-shrink-0 w-80 h-56 rounded-2xl overflow-hidden cursor-pointer relative bg-muted hover-lift"
                          onClick={() => openLightbox(gallery, idx)}
                        >
                          <img
                            src={image.image_url}
                            alt={image.alt_text || gallery.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Caption on hover */}
                          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                            {image.caption && (
                              <p className="text-white text-sm font-medium">{image.caption}</p>
                            )}
                            <p className="text-white/60 text-xs mt-1">Klik untuk memperbesar</p>
                          </div>
                          {/* Image count badge */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-xs backdrop-blur-sm">
                              <ImageIcon className="h-3 w-3" />
                              {idx + 1}/{gallery.images.length}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 rounded-2xl bg-muted/50 border border-border/30">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">Belum ada gallery yang tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!lightboxItem} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border border-border/20 backdrop-blur-xl rounded-2xl">
          {lightboxItem && lightboxItem.images[lightboxIndex] && (
            <div className="relative">
              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 h-9 w-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image */}
              <div className="aspect-video bg-black flex items-center justify-center">
                <img
                  src={lightboxItem.images[lightboxIndex].image_url}
                  alt={lightboxItem.images[lightboxIndex].alt_text || lightboxItem.title}
                  className="max-h-full max-w-full object-contain animate-scale-in"
                />
              </div>

              {/* Navigation */}
              {lightboxItem.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Caption & counter */}
              <div className="bg-black/80 backdrop-blur-sm px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{lightboxItem.title}</p>
                    {lightboxItem.images[lightboxIndex].caption && (
                      <p className="text-white/50 text-xs mt-1">{lightboxItem.images[lightboxIndex].caption}</p>
                    )}
                  </div>
                  <span className="text-white/50 text-xs font-medium">
                    {lightboxIndex + 1} / {lightboxItem.images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {lightboxItem.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-black/90 overflow-x-auto scrollbar-hide">
                  {lightboxItem.images.map((img, i) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxIndex(i)}
                      className={`flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${i === lightboxIndex ? 'border-primary scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                        }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
