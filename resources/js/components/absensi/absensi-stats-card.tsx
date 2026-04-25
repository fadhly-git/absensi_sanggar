import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    jumlah_masuk: number;
    jumlah_tidak: number;
    isLoading?: boolean;
}

export const AbsensiStatsCard: React.FC<Props> = ({ jumlah_masuk, jumlah_tidak, isLoading }) => {
    return (
        <Card>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Siswa Masuk</div>
                                <div className="mt-1 text-2xl font-semibold text-foreground">{isLoading ? '...' : jumlah_masuk}</div>
                            </div>
                            <Badge variant="default">Masuk</Badge>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Siswa Tidak Berangkat</div>
                                <div className="mt-1 text-2xl font-semibold text-foreground">{isLoading ? '...' : jumlah_tidak}</div>
                            </div>
                            <Badge variant="destructive">Tidak</Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AbsensiStatsCard;
