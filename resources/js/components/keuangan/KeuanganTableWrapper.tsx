import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DataTableKeuangan, DataTableKeuanganProps } from '@/components/keuangan/data-table';

type Props = {
  title: string;
  type: 'masuk' | 'keluar';
  data?: DataTableKeuanganProps['datas'];
  isLoading: boolean;
  error?: Error | null;
};

export const KeuanganTableWrapper: React.FC<Props> = ({ title, type, data = [], isLoading, error }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader className="px-4 py-3 flex items-center justify-between mt-4">
        <CardTitle>{title}</CardTitle>
        {safeData.length > 0 && <div className="text-sm text-muted-foreground">{safeData.length} transaksi</div>}
      </CardHeader>
      <CardContent className="p-4">
        {error ? (
          <div className="py-8">
            <Alert variant="destructive">Gagal memuat data {type}: {error.message}</Alert>
            <div className="mt-3 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => window.location.reload()}>Muat ulang</Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-10 text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : safeData.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">Tidak ada transaksi {type}</div>
        ) : (
          <DataTableKeuangan datas={safeData} type={type} isLoading={false} />
        )}
      </CardContent>
    </Card>
  );
};

export default KeuanganTableWrapper;
