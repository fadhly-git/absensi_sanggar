import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { KeuanganTabs } from '@/components/keuangan/form-keuangan';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ExportButtonFinancial } from '@/components/keuangan/export-data';
import KeuanganFilterBar from '@/components/keuangan/KeuanganFilterBar';
import KeuanganTableWrapper from '@/components/keuangan/KeuanganTableWrapper';
import { CardSaldo } from '@/components/section-card';
import { type BreadcrumbItem } from '@/types';
import { fetchSaldo, fetchTransactions } from '@/services/keuanganApi';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Keuangan', href: route('atmin.keuangan') },
];

type FilterState = {
  mode: 'year' | 'month';
  date: string;
};

export default function Keuangan() {
  const [filter, setFilter] = useState<FilterState>(() => {
    const year = new Date().getFullYear().toString();
    return { mode: 'year', date: year };
  });

  const isMonthMode = filter.mode === 'month';

  const saldoQuery = useQuery({
    queryKey: ['saldo'],
    queryFn: fetchSaldo,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  const uangMasukQuery = useQuery({
    queryKey: ['transactions', 'masuk', filter.date, filter.mode],
    queryFn: () => fetchTransactions('masuk', filter.date, filter.mode),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: 1000,
  });

  const uangKeluarQuery = useQuery({
    queryKey: ['transactions', 'keluar', filter.date, filter.mode],
    queryFn: () => fetchTransactions('keluar', filter.date, filter.mode),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: 1000,
  });

  const saldoData = useMemo(
    () =>
      saldoQuery.data
        ? {
            terakhir: saldoQuery.data.saldo_terakhir || 0,
            sebelumnya: saldoQuery.data.saldo_sebelumnya || 0,
          }
        : undefined,
    [saldoQuery.data]
  );

  const uangMasukData = useMemo(() => {
    const data = uangMasukQuery.data;
    return Array.isArray(data) ? data : [];
  }, [uangMasukQuery.data]);

  const uangKeluarData = useMemo(() => {
    const data = uangKeluarQuery.data;
    return Array.isArray(data) ? data : [];
  }, [uangKeluarQuery.data]);

  const handleModeChange = useCallback((checked: boolean) => {
    const mode = checked ? 'month' : 'year';
    const now = new Date();
    setFilter({
      mode,
      date:
        mode === 'month'
          ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
          : now.getFullYear().toString(),
    });
  }, []);

  const handleDateChange = useCallback((val: string) => setFilter((f) => ({ ...f, date: val })), []);

  const handleRetry = useCallback(() => {
    saldoQuery.refetch();
    uangMasukQuery.refetch();
    uangKeluarQuery.refetch();
  }, [saldoQuery, uangMasukQuery, uangKeluarQuery]);

  const hasGlobalError = Boolean(saldoQuery.error && uangMasukQuery.error && uangKeluarQuery.error);

  if (hasGlobalError) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Keuangan" />
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 p-6">
          <h3 className="text-lg font-semibold text-destructive">Terjadi kesalahan saat memuat data</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {saldoQuery.error?.message || uangMasukQuery.error?.message || uangKeluarQuery.error?.message}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={handleRetry} className="px-3 py-1.5 border rounded-md bg-transparent hover:bg-muted">
              Coba Lagi
            </button>
            <button type="button" onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
              Muat Ulang
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Keuangan" />

      <main className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-center">
            <KeuanganFilterBar isMonthMode={isMonthMode} date={filter.date} onModeChange={handleModeChange} onDateChange={handleDateChange}>
                <div className="flex items-center gap-2">
                    <ExportButtonFinancial date={filter.date} param={filter.mode} />
                    <KeuanganTabs />
                </div>
            </KeuanganFilterBar>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="border rounded-xl bg-background shadow-sm">
              <Tabs defaultValue="masuk">
                <div className="px-4 py-3 border-b">
                  <TabsList className="w-full max-w-md">
                    <TabsTrigger value="masuk">Uang Masuk</TabsTrigger>
                    <TabsTrigger value="keluar">Uang Keluar</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4">
                  <TabsContent value="masuk">
                    <KeuanganTableWrapper
                      title="Uang Masuk"
                      type="masuk"
                      data={uangMasukData}
                      isLoading={uangMasukQuery.isLoading}
                      error={uangMasukQuery.error}
                    />
                  </TabsContent>

                  <TabsContent value="keluar">
                    <KeuanganTableWrapper
                      title="Uang Keluar"
                      type="keluar"
                      data={uangKeluarData}
                      isLoading={uangKeluarQuery.isLoading}
                      error={uangKeluarQuery.error}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border bg-background p-4 shadow-sm sticky top-20">
              <CardSaldo data={saldoData} isLoading={saldoQuery.isLoading} />
            </div>
          </aside>
        </div>
      </main>
    </AppLayout>
  );
}
