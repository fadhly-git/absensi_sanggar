import React from 'react';
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

    // MOBILE: tampilkan sebagai card; DESKTOP: tetap tabel
    return (
        <div className="w-full mx-auto container dark:bg-background">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-background">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12 px-2 py-3 bg-background text-foreground">
                                <Checkbox
                                    checked={data.length > 0 && selectedIds.length === data.length}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                />
                            </th>
                            <th className="px-2 py-3 text-left bg-background text-foreground">Nama & Alamat</th>
                            <th className="px-2 py-3 text-left bg-background text-foreground">Status</th>
                            <th className="px-2 py-3 text-left bg-background text-foreground">Statistik Absensi</th>
                            <th className="px-2 py-3 text-left bg-background text-foreground">Terdaftar</th>
                            <th className="w-16 px-2 py-3 text-left bg-background text-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-gray-100 dark:divide-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 bg-background text-foreground">
                                    Tidak ada data siswa
                                </td>
                            </tr>
                        ) : (
                            data.map((siswa) => (
                                <tr key={siswa.id}>
                                    <td className="px-2 py-2 align-top">
                                        <Checkbox
                                            checked={selectedIds.includes(siswa.id)}
                                            onCheckedChange={(checked) =>
                                                handleSelectItem(siswa.id, checked as boolean)
                                            }
                                            aria-label={`Select ${siswa.nama}`}
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <div className="font-medium">{siswa.nama}</div>
                                        <div className="text-sm text-gray-500 flex items-start gap-1">
                                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{siswa.alamat}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 align-top">
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
                                    </td>
                                    <td className="px-2 py-2 align-top">
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
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(siswa.tanggal_terdaftar), {
                                                addSuffix: true,
                                                locale: localeId
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 align-top">
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
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4 mx-auto">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white dark:bg-gray-900 rounded-lg shadow">
                        Tidak ada data siswa
                    </div>
                ) : data.map((siswa) => (
                    <div
                        key={siswa.id}
                        className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-2 relative"
                    >
                        <div className="absolute top-2 right-2">
                            <Checkbox
                                checked={selectedIds.includes(siswa.id)}
                                onCheckedChange={(checked) =>
                                    handleSelectItem(siswa.id, checked as boolean)
                                }
                                aria-label={`Select ${siswa.nama}`}
                            />
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 dark:text-gray-300">Nama</span>
                            <span className="font-bold text-gray-700 dark:text-gray-100">{siswa.nama}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 dark:text-gray-300">Alamat</span>
                            <span className="text-gray-600 dark:text-gray-200 text-sm flex items-start gap-1">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{siswa.alamat}</span>
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 dark:text-gray-300">Status</span>
                            <Badge
                                variant={siswa.status ? "default" : "secondary"}
                                className={
                                    siswa.status
                                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200"
                                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200"
                                }
                            >
                                {siswa.status ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 dark:text-gray-300">Statistik Absensi</span>
                            <span className="text-gray-600 dark:text-gray-200 text-sm">
                                Total: {siswa.total_absensi ?? "-"} | Bulan ini: {siswa.absensi_bulan_ini ?? "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 dark:text-gray-300">Terdaftar</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(siswa.tanggal_terdaftar), {
                                    addSuffix: true,
                                    locale: localeId
                                })}
                            </span>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" size="icon" onClick={() => onView(siswa)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(siswa)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(siswa.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}