import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Edit,
    Trash2,
    MoreVertical,
    Eye,
    MapPin,
    Calendar
} from 'lucide-react';
import type { Siswa } from '@/types/siswa';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface SiswaTableProps {
    data: Siswa[];
    isLoading: boolean;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
    onEdit: (siswa: Siswa) => void;
    onDelete: (id: number) => void;
    onView: (siswa: Siswa) => void;
}

export function SiswaTable({
    data,
    isLoading,
    selectedIds,
    onSelectionChange,
    onEdit,
    onDelete,
    onView,
}: SiswaTableProps) {
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(data.map(siswa => siswa.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={data.length > 0 && selectedIds.length === data.length}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all"
                            />
                        </TableHead>
                        <TableHead>Nama & Alamat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Statistik Absensi</TableHead>
                        <TableHead>Terdaftar</TableHead>
                        <TableHead className="w-16">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                Tidak ada data siswa
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((siswa) => (
                            <TableRow key={siswa.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(siswa.id)}
                                        onCheckedChange={(checked) =>
                                            handleSelectItem(siswa.id, checked as boolean)
                                        }
                                        aria-label={`Select ${siswa.nama}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{siswa.nama}</div>
                                        <div className="text-sm text-gray-500 flex items-start gap-1">
                                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{siswa.alamat}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={siswa.status ? "default" : "secondary"}
                                        className={
                                            siswa.status
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                        }
                                    >
                                        {siswa.status ? 'Aktif' : 'Tidak Aktif'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm space-y-1">
                                        {siswa.total_absensi !== undefined && (
                                            <div className="text-gray-600">
                                                Total: {siswa.total_absensi} kali
                                            </div>
                                        )}
                                        {siswa.absensi_bulan_ini !== undefined && (
                                            <div className="text-blue-600">
                                                Bulan ini: {siswa.absensi_bulan_ini} kali
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(siswa.created_at), {
                                            addSuffix: true,
                                            locale: localeId
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView(siswa)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(siswa)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(siswa.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}