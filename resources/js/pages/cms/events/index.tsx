import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Edit,
  Trash2,
  XCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import CMSLayout from '@/layouts/cms/cms-layout';

interface Event {
  id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  event_type: 'latihan' | 'ujian' | 'pentas' | 'libur' | 'other';
  color: string;
  is_cancelled: boolean;
  cancel_reason: string | null;
  creator: {
    id: number;
    name: string;
  };
}

const EVENT_TYPE_LABELS = {
  latihan: 'Latihan',
  ujian: 'Ujian',
  pentas: 'Pentas',
  libur: 'Libur',
  other: 'Lainnya',
};

const EVENT_TYPE_COLORS = {
  latihan: '#10b981',
  ujian: '#f59e0b',
  pentas: '#8b5cf6',
  libur: '#ef4444',
  other: '#3b82f6',
};

export default function EventsIndex() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [cancelEventId, setCancelEventId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/events/api', {
        params: {
          start_date: format(monthStart, 'yyyy-MM-dd'),
          end_date: format(monthEnd, 'yyyy-MM-dd'),
          calendar: true,
        },
      });
      return response.data;
    },
  });

  // Fetch upcoming events for list view
  const { data: upcomingEvents = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['events-upcoming'],
    queryFn: async () => {
      const response = await axios.get('/atmin/cms/events/api', {
        params: {
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: format(addMonths(new Date(), 12), 'yyyy-MM-dd'), // Next 1 year
          calendar: true,
        },
      });
      return response.data;
    },
    enabled: viewMode === 'list',
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await axios.delete(`/atmin/cms/events/api/${eventId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event berhasil dihapus');
      setDeleteEventId(null);
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus event', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: number; reason: string }) => {
      const response = await axios.patch(`/atmin/cms/events/api/${eventId}/cancel`, {
        cancel_reason: reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event berhasil dibatalkan');
      setCancelEventId(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast.error('Gagal membatalkan event', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event: Event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;
      return day >= eventStart && day <= eventEnd;
    });
  };

  const handleCancelSubmit = () => {
    if (cancelEventId && cancelReason.trim()) {
      cancelMutation.mutate({ eventId: cancelEventId, reason: cancelReason });
    }
  };

  const renderCalendarView = () => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const calendarDays = [
      ...Array(daysFromPrevMonth).fill(null),
      ...daysInMonth,
    ];

    return (
      <div className="rounded-lg border border-border bg-card">
        {/* Calendar Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: localeId })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              &larr; Sebelumnya
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hari Ini
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              Selanjutnya &rarr;
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {/* Day Headers */}
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div
              key={day}
              className="bg-muted px-2 py-3 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div key={`empty-${index}`} className="min-h-[120px] bg-muted/30" />
              );
            }

            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <ContextMenu key={day.toISOString()}>
                <ContextMenuTrigger
                  className={`min-h-[120px] block bg-background p-2 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none cursor-context-menu ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  title="Klik kanan untuk melihat opsi"
                >
                  <div
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday
                        ? 'bg-primary text-primary-foreground font-bold'
                        : dayEvents.length > 0
                          ? 'text-white font-medium shadow-sm'
                          : 'text-foreground'
                      }`}
                    style={
                      !isToday && dayEvents.length > 0
                        ? { backgroundColor: dayEvents[0].color }
                        : {}
                    }
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full truncate rounded px-1 py-0.5 text-left text-xs hover:opacity-80"
                        style={{
                          backgroundColor: event.color + '20',
                          color: event.color,
                        }}
                      >
                        {event.is_cancelled && <XCircle className="mr-1 inline h-3 w-3" />}
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="px-1 text-xs text-muted-foreground">
                        +{dayEvents.length - 3} lainnya
                      </div>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                  <ContextMenuLabel>{format(day, 'dd MMMM yyyy', { locale: localeId })}</ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => router.visit(route('atmin.cms.events.create', { date: format(day, 'yyyy-MM-dd') }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Event di Tanggal Ini
                  </ContextMenuItem>
                  {dayEvents.length > 0 && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuLabel>Lihat Event</ContextMenuLabel>
                      {dayEvents.map((event: any) => (
                        <ContextMenuItem key={event.id} onClick={() => setSelectedEvent(event)}>
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: event.color }} />
                          <span className="truncate">{event.title}</span>
                        </ContextMenuItem>
                      ))}
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>
    );
  };
  const renderListView = () => {
    if (isLoadingUpcoming) {
      return (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    const sortedEvents = [...upcomingEvents].sort(
      // Sort ascending, but filter for upcoming from today
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ).filter(e => new Date(e.start_date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0));

    return (
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12">
            <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada event di bulan ini</p>
          </div>
        ) : (
          sortedEvents.map((event: Event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div
                className="h-12 w-1 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!event.is_cancelled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCancelEventId(event.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteEventId(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    style={{
                      backgroundColor: event.color + '20',
                      color: event.color,
                    }}
                  >
                    {EVENT_TYPE_LABELS[event.event_type]}
                  </Badge>
                  {event.is_cancelled && (
                    <Badge variant="destructive">Dibatalkan</Badge>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(event.start_date), 'dd MMM yyyy HH:mm', {
                      locale: localeId,
                    })}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>
                {event.is_cancelled && event.cancel_reason && (
                  <p className="mt-2 text-sm text-destructive">
                    Alasan: {event.cancel_reason}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <CMSLayout breadcrumbs={[{ title: 'Events', href: route('atmin.cms.events.index') }]}>
      <Head title="Kelola Event - CMS" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kalender Event</h1>
            <p className="text-muted-foreground">
              Kelola jadwal latihan, ujian, pentas, dan kegiatan lainnya
            </p>
          </div>
          <Link href={route('atmin.cms.events.create')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Event
            </Button>
          </Link>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Kalender
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              Daftar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            {renderCalendarView()}
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            {renderListView()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Detail event</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.description && (
                <p className="text-sm">{selectedEvent.description}</p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    style={{
                      backgroundColor: selectedEvent.color + '20',
                      color: selectedEvent.color,
                    }}
                  >
                    {EVENT_TYPE_LABELS[selectedEvent.event_type]}
                  </Badge>
                  {selectedEvent.is_cancelled && (
                    <Badge variant="destructive">Dibatalkan</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(selectedEvent.start_date), 'dd MMM yyyy HH:mm', {
                    locale: localeId,
                  })}
                  {selectedEvent.end_date && (
                    <>
                      {' - '}
                      {format(new Date(selectedEvent.end_date), 'dd MMM yyyy HH:mm', {
                        locale: localeId,
                      })}
                    </>
                  )}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.is_cancelled && selectedEvent.cancel_reason && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                    <strong>Alasan pembatalan:</strong> {selectedEvent.cancel_reason}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Event Dialog */}
      <Dialog open={!!cancelEventId} onOpenChange={() => setCancelEventId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Event</DialogTitle>
            <DialogDescription>
              Masukkan alasan pembatalan event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancel_reason">Alasan Pembatalan</Label>
              <Textarea
                id="cancel_reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Cuaca buruk, instruktur berhalangan, dll"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelEventId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubmit}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              Batalkan Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Event yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && deleteMutation.mutate(deleteEventId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
