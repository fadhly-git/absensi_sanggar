import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Calendar, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { Siswa } from '@/types/siswa';

interface Props {
    data: Siswa[];
    isLoading: boolean;
    selectedIds: number[];
    onSelect: (id: number, checked: boolean) => void;
    onEdit: (s: Siswa) => void;
    onDelete: (id: number) => void;
}

export function SiswaCardGrid({ data, isLoading, selectedIds, onSelect, onEdit, onDelete }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((siswa) => (
                <Card key={siswa.id} className="group relative overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-3 left-3 z-10">
                        <Checkbox
                            checked={selectedIds.includes(siswa.id)}
                            onCheckedChange={(checked) => onSelect(siswa.id, Boolean(checked))}
                        />
                    </div>

                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4 pl-7">
                            <div className="space-y-1">
                                <h4 className="font-bold text-lg leading-none tracking-tight">{siswa.nama}</h4>
                                <Badge variant={siswa.status ? "default" : "secondary"} className={siswa.status ? "bg-emerald-500/15 text-emerald-600" : ""}>
                                    {siswa.status ? 'Aktif' : 'Non-Aktif'}
                                </Badge>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(siswa)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(siswa.id)}><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <p className="line-clamp-2">{siswa.alamat}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>{new Date(siswa.tanggal_terdaftar).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 border-t py-3 flex justify-around">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Hadir</p>
                            <p className="font-semibold text-foreground">{siswa.total_absensi ?? 0}</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Bulan Ini</p>
                            <p className="font-semibold text-primary">{siswa.absensi_bulan_ini ?? 0}</p>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
