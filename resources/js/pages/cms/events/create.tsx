import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import CMSLayout from '@/layouts/cms/cms-layout';
import { DatePicker } from '@/components/molecules/date-picker';
import { TimePicker } from '@/components/molecules/time-picker';
import { Checkbox } from '@/components/ui/checkbox';

const eventSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Tanggal mulai harus diisi'),
  start_time: z.string().min(1, 'Waktu mulai harus diisi'),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  event_type: z.enum(['latihan', 'ujian', 'pentas', 'libur', 'other']),
  color: z.string().optional(),
  recurrence_type: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
  recurrence_interval: z.number().min(1).default(1),
  recurrence_days: z.array(z.string()).optional(),
  recurrence_until: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEditEventProps {
  eventId?: string;
}

const EVENT_TYPE_OPTIONS = [
  { value: 'latihan', label: 'Latihan', color: '#10b981' },
  { value: 'ujian', label: 'Ujian', color: '#f59e0b' },
  { value: 'pentas', label: 'Pentas', color: '#8b5cf6' },
  { value: 'libur', label: 'Libur', color: '#ef4444' },
  { value: 'other', label: 'Lainnya', color: '#3b82f6' },
];

export default function CreateEditEvent({ eventId }: CreateEditEventProps) {
  const isEdit = !!eventId;
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlDate = searchParams.get('date');

  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_type: 'latihan',
      color: '#10b981',
      recurrence_type: 'none',
      recurrence_interval: 1,
      recurrence_days: [],
      start_date: urlDate || format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const watchEventType = watch('event_type');

  // Update color when event type changes
  useEffect(() => {
    const typeOption = EVENT_TYPE_OPTIONS.find((opt) => opt.value === watchEventType);
    if (typeOption) {
      setSelectedColor(typeOption.color);
      setValue('color', typeOption.color);
    }
  }, [watchEventType, setValue]);

  // Fetch event if editing
  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await axios.get(`/atmin/cms/events/api/${eventId}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  // Set form values when event data is loaded
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;

      reset({
        title: event.title,
        description: event.description || '',
        start_date: format(startDate, 'yyyy-MM-dd'),
        start_time: format(startDate, 'HH:mm'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        end_time: endDate ? format(endDate, 'HH:mm') : '',
        location: event.location || '',
        event_type: event.event_type,
        color: event.color,
        recurrence_type: event.recurrence_type || 'none',
        recurrence_interval: event.recurrence_interval || 1,
        recurrence_days: event.recurrence_days || [],
        recurrence_until: event.recurrence_until ? format(new Date(event.recurrence_until), 'yyyy-MM-dd') : '',
      });
      setSelectedColor(event.color);
    }
  }, [event, reset]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      // Combine date and time
      const startDateTime = `${data.start_date} ${data.start_time}`;
      const endDateTime =
        data.end_date && data.end_time
          ? `${data.end_date} ${data.end_time}`
          : null;

      const payload = {
        title: data.title,
        description: data.description || null,
        start_date: startDateTime,
        end_date: endDateTime,
        location: data.location || null,
        event_type: data.event_type,
        color: data.color || selectedColor,
        recurrence_type: data.recurrence_type,
        recurrence_interval: data.recurrence_interval,
        recurrence_days: data.recurrence_days,
        recurrence_until: data.recurrence_until || null,
      };

      if (isEdit) {
        const response = await axios.put(
          `/atmin/cms/events/api/${eventId}`,
          payload
        );
        return response.data;
      } else {
        const response = await axios.post('/atmin/cms/events/api', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Event berhasil diupdate' : 'Event berhasil dibuat');
      router.visit('/atmin/cms/events');
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan event', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    saveMutation.mutate(data);
  };

  if (isEdit && loadingEvent) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CMSLayout
      breadcrumbs={[
        { title: 'Events', href: route('atmin.cms.events.index') },
        { title: isEdit ? 'Edit Event' : 'Tambah Event', href: '#' },
      ]}
    >
      <Head title={isEdit ? 'Edit Event' : 'Tambah Event Baru'} />

      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/atmin/cms/events">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEdit ? 'Edit Event' : 'Tambah Event Baru'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Ubah detail event' : 'Tambahkan event ke kalender'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Event</CardTitle>
              <CardDescription>
                Informasi tentang event yang akan dibuat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Judul Event <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Contoh: Latihan Rutin, Ujian Kenaikan Tingkat"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detail tambahan tentang event"
                  rows={3}
                />
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="event_type">
                  Tipe Event <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watchEventType}
                  onValueChange={(value) =>
                    setValue('event_type', value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.event_type && (
                  <p className="text-sm text-destructive">
                    {errors.event_type.message}
                  </p>
                )}
              </div>

              {/* Start Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Tanggal Mulai <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <DatePicker
                        id="start_date"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                        }}
                      />
                    )}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">
                    Waktu Mulai <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="start_time"
                    render={({ field }) => (
                      <TimePicker
                        id="start_time"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.start_time && (
                    <p className="text-sm text-destructive">
                      {errors.start_time.message}
                    </p>
                  )}
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
                  <Controller
                    control={control}
                    name="end_date"
                    render={({ field }) => (
                      <DatePicker
                        id="end_date"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                        }}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan jika event hanya 1 hari
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Waktu Selesai (Opsional)</Label>
                  <Controller
                    control={control}
                    name="end_time"
                    render={({ field }) => (
                      <TimePicker
                        id="end_time"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Recurrence Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="recurrence_type"
                    render={({ field }) => (
                      <Checkbox
                        id="is_recurring"
                        checked={field.value !== 'none'}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? 'weekly' : 'none');
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="is_recurring" className="font-semibold text-base cursor-pointer">
                    Event Berulang
                  </Label>
                </div>

                {watch('recurrence_type') !== 'none' && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20 ml-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frekuensi</Label>
                        <Select
                          value={watch('recurrence_type')}
                          onValueChange={(value) => setValue('recurrence_type', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Harian</SelectItem>
                            <SelectItem value="weekly">Mingguan</SelectItem>
                            <SelectItem value="monthly">Bulanan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Interval (Setiap X {watch('recurrence_type') === 'daily' ? 'hari' : watch('recurrence_type') === 'weekly' ? 'minggu' : 'bulan'})</Label>
                        <Input
                          type="number"
                          min={1}
                          {...register('recurrence_interval', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    {watch('recurrence_type') === 'weekly' && (
                      <div className="space-y-2">
                        <Label>Ulangi pada hari</Label>
                        <div className="flex flex-wrap gap-3 pt-1">
                          {[
                            { label: 'Sen', value: 'Mon' },
                            { label: 'Sel', value: 'Tue' },
                            { label: 'Rab', value: 'Wed' },
                            { label: 'Kam', value: 'Thu' },
                            { label: 'Jum', value: 'Fri' },
                            { label: 'Sab', value: 'Sat' },
                            { label: 'Min', value: 'Sun' },
                          ].map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day.value}`}
                                checked={watch('recurrence_days')?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  const currentDays = watch('recurrence_days') || [];
                                  if (checked) {
                                    setValue('recurrence_days', [...currentDays, day.value]);
                                  } else {
                                    setValue('recurrence_days', currentDays.filter((d) => d !== day.value));
                                  }
                                }}
                              />
                              <Label htmlFor={`day-${day.value}`} className="text-sm font-normal cursor-pointer">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Berakhir pada (Opsional)</Label>
                      <Controller
                        control={control}
                        name="recurrence_until"
                        render={({ field }) => (
                          <DatePicker
                            id="recurrence_until"
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                            }}
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Jika kosong, pengulangan akan terus berlanjut.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi (Opsional)</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Contoh: Pendopo, Gedung Kesenian, dll"
                />
              </div>

              {/* Color Preview */}
              <div className="space-y-2">
                <Label>Warna Event</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Warna otomatis berdasarkan tipe event
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Update Event' : 'Simpan Event'}
            </Button>
            <Link href="/atmin/cms/events">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </CMSLayout>
  );
}
