import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Music2,
  Send,
  Sparkles,
} from 'lucide-react';
import SEOHead from '@/components/seo/seo-head';
import { generateBreadcrumbSchema } from '@/lib/structuredData';
import PublicLayout from '@/layouts/public-layout';

interface PageSections {
  title?: string;
  subtitle?: string;
  address?: string;
  map_embed?: string;
}

interface SiteSetting { key: string; value: string }
interface SocialLink { platform: string; url: string }

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  tiktok: <Music2 className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: object) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

const MapEmbed = memo(({ html }: { html: string }) => (
  <Card className="overflow-hidden rounded-2xl mb-16 border-border/40">
    <div className="w-full h-80" dangerouslySetInnerHTML={{ __html: html }} />
  </Card>
));

export default function KontakKami() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ title: '', description: '', isError: false });
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;

    const initRecaptcha = () => {
      if (recaptchaRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: () => setRecaptchaVerified(true),
          'expired-callback': () => setRecaptchaVerified(false),
        });
      }
    };

    if (window.grecaptcha) {
      initRecaptcha();
    } else {
      window.onRecaptchaLoad = initRecaptcha;
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const { data: pageData } = useQuery({
    queryKey: ['public-page', 'contact'],
    queryFn: async () => {
      const response = await axios.get('/api/pages/contact');
      return response.data.data as { sections: PageSections };
    },
  });

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const response = await axios.get('/api/settings');
      return response.data.data as SiteSetting[];
    },
  });

  const { data: socialLinks } = useQuery({
    queryKey: ['public-social-links'],
    queryFn: async () => {
      const response = await axios.get('/api/social-links');
      return response.data.data as SocialLink[];
    },
  });

  const getSetting = (key: string) => settings?.find((s) => s.key === key)?.value || '';

  const contactEmail = getSetting('contact_email');
  const contactPhone = getSetting('contact_phone');
  const contactWhatsapp = getSetting('contact_whatsapp');
  const contactAddress = pageData?.sections?.address || getSetting('contact_address');
  const mapEmbed = pageData?.sections?.map_embed || getSetting('contact_map_embed');
  const pageTitle = pageData?.sections?.title || 'Hubungi Kami';
  const pageSubtitle = pageData?.sections?.subtitle || 'Jangan ragu untuk menghubungi kami jika ada pertanyaan';

  const sendMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; subject: string; message: string; recaptcha_token: string }) => {
      const response = await axios.post('/api/contact', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAlertMsg({ title: 'Pesan Terkirim!', description: data.message, isError: false });
      setAlertOpen(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setRecaptchaVerified(false);
      if (widgetIdRef.current !== null) window.grecaptcha.reset(widgetIdRef.current);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Terjadi kesalahan. Silakan coba lagi.';
      setAlertMsg({ title: 'Gagal Mengirim', description: msg, isError: true });
      setAlertOpen(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = widgetIdRef.current !== null
      ? window.grecaptcha.getResponse(widgetIdRef.current)
      : '';
    if (!token) {
      setAlertMsg({ title: 'Verifikasi Diperlukan', description: 'Silakan centang kotak reCAPTCHA terlebih dahulu.', isError: true });
      setAlertOpen(true);
      return;
    }
    sendMutation.mutate({ ...form, recaptcha_token: token });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Kontak Kami', url: '/contact' },
  ]);

  const contactCards = [
    contactEmail && { icon: <Mail className="h-5 w-5" />, label: 'Email', value: contactEmail, href: `mailto:${contactEmail}` },
    contactPhone && { icon: <Phone className="h-5 w-5" />, label: 'Telepon', value: contactPhone, href: `tel:${contactPhone}` },
    contactWhatsapp && { icon: <MessageCircle className="h-5 w-5" />, label: 'WhatsApp', value: `+${contactWhatsapp}`, href: `https://wa.me/${contactWhatsapp}` },
    contactAddress && { icon: <MapPin className="h-5 w-5" />, label: 'Alamat', value: contactAddress, href: undefined },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href?: string }[];

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
            Kontak
          </span>
          <h1 className="text-4xl font-bold text-white lg:text-6xl tracking-tight">
            <span className="golden-text">{pageTitle}</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">{pageSubtitle}</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      {contactCards.length > 0 && (
        <section className="relative py-20 bg-background overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-15" />
          <div className="relative container mx-auto max-w-4xl px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
              {contactCards.map((card, i) => (
                <Card
                  key={i}
                  className={`group p-6 text-center rounded-2xl border-border/40 hover-lift hover:border-primary/30 transition-all duration-300 animate-fade-in-up delay-${(i + 1) * 100}`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      {card.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{card.label}</h3>
                  {card.href ? (
                    <a
                      href={card.href}
                      target={card.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary break-all transition-colors duration-200"
                    >
                      {card.value}
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{card.value}</p>
                  )}
                </Card>
              ))}
            </div>

            {/* Map */}
            {mapEmbed && <MapEmbed html={mapEmbed} />}
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className="relative pb-24 bg-background overflow-hidden mt-[-2rem]">
        <div className="relative container mx-auto max-w-4xl px-4">
          <Card className="p-8 md:p-10 rounded-2xl border-border/40 shadow-lg animate-fade-in-up">
            <div className="text-center mb-8 space-y-2">
              <span className="section-label">Kirim Pesan</span>
              <h2 className="text-2xl font-bold">Ada Pertanyaan?</h2>
              <p className="text-muted-foreground text-sm">
                Isi formulir di bawah ini dan kami akan segera menghubungi Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id="contact-name"
                  placeholder="Nama Anda"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="rounded-xl border-border/50 bg-card/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="rounded-xl border-border/50 bg-card/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject" className="text-sm font-medium">
                  Subjek
                </Label>
                <Input
                  id="contact-subject"
                  placeholder="Perihal pesan"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="rounded-xl border-border/50 bg-card/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-sm font-medium">
                  Pesan
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tulis pesan Anda di sini..."
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="rounded-xl border-border/50 bg-card/50 focus:border-primary/50 resize-none"
                />
              </div>

              {/* reCAPTCHA */}
              <div className="flex justify-center" ref={recaptchaRef} />

              <Button
                type="submit"
                className="w-full rounded-xl py-5 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={sendMutation.isPending || !recaptchaVerified}
              >
                {sendMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Kirim Pesan
                  </span>
                )}
              </Button>

            </form>
          </Card>
        </div>
      </section>

      {/* Social Media */}
      {socialLinks && socialLinks.length > 0 && (
        <section className="relative py-16 overflow-hidden">
          <div className="golden-divider" />
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background" />
          <div className="absolute inset-0 pattern-dots opacity-10" />

          <div className="relative container mx-auto max-w-7xl px-4 text-center pt-8 space-y-6">
            <span className="section-label">Media Sosial</span>
            <h2 className="text-xl font-bold">Ikuti Kami</h2>
            <p className="text-muted-foreground text-sm">Tetap terhubung melalui media sosial</p>
            <div className="flex justify-center gap-4 flex-wrap pt-2">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group h-12 w-12 rounded-xl border border-border/50 bg-card flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  title={link.platform}
                >
                  {socialIcons[link.platform] ?? null}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className={alertMsg.isError ? 'text-destructive' : ''}>
              {alertMsg.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMsg.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)} className="rounded-xl">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PublicLayout>
  );
}
