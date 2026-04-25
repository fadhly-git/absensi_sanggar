import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    data: any[];
    sundays: string[];
    isLoading?: boolean;
    onEdit?: (row: any) => void;
}

export const AbsensiCardGrid: React.FC<Props> = ({ data, sundays, isLoading, onEdit }) => {
    if (isLoading) return <div className="py-12 flex items-center justify-center">Memuat...</div>;
    if (!data || data.length === 0) return <div className="py-12 text-center text-muted-foreground">Tidak ada data</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((row) => (
                <Card key={row.siswa_id}>
                    <CardHeader>
                        <CardTitle className="text-sm">{row.siswa_nama}</CardTitle>
                        <CardDescription className="text-xs">{row.siswa_alamat}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-2">
                            {sundays.map((d: string) => {
                                const val = row[d] || '-';
                                const label = val === 'H' ? 'Hadir' : val === 'B' ? 'Bonus' : val === 'T' ? 'Tidak' : '-';
                                const variant = val === 'H' ? 'default' : val === 'B' ? 'secondary' : val === 'T' ? 'destructive' : 'outline';
                                return (
                                    <div key={d} className="flex flex-col items-center p-1">
                                        <Badge variant={variant} className="px-2 py-1 text-xs font-semibold">{label}</Badge>
                                        <div className="text-[11px] text-muted-foreground mt-1">{new Date(d).toLocaleDateString('id-ID')}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Total hadir minggu: {sundays.reduce((acc: number, d: string) => acc + (row[d] === 'H' || row[d] === 'B' ? 1 : 0), 0)}</div>
                        <div>
                            <Button size="sm" variant="ghost" onClick={() => onEdit?.(row)}>Edit</Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default AbsensiCardGrid;
