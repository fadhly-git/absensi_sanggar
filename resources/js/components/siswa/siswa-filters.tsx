import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import type { SiswaFilters } from '@/types/siswa';

interface SiswaFiltersProps {
    filters: SiswaFilters;
    onFiltersChange: (filters: Partial<SiswaFilters>) => void;
    onReset: () => void;
}

export function SiswaFiltersComponent({
    filters,
    onFiltersChange,
    onReset
}: SiswaFiltersProps) {
    const hasActiveFilters = filters.search || filters.status !== 'all';

    return (
        <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter & Pencarian
                </h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        <X className="h-4 w-4 mr-1" />
                        Reset
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Cari nama atau alamat..."
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ search: e.target.value })}
                        className="pl-10"
                    />
                </div>

                <Select
                    value={filters.status}
                    onValueChange={(value) => onFiltersChange({ status: value as any })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="true">Aktif</SelectItem>
                        <SelectItem value="false">Tidak Aktif</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split('-') as [any, any];
                        onFiltersChange({ sortBy, sortOrder });
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nama-asc">Nama A-Z</SelectItem>
                        <SelectItem value="nama-desc">Nama Z-A</SelectItem>
                        <SelectItem value="alamat-asc">Alamat A-Z</SelectItem>
                        <SelectItem value="alamat-desc">Alamat Z-A</SelectItem>
                        <SelectItem value="created_at-desc">Terbaru</SelectItem>
                        <SelectItem value="created_at-asc">Terlama</SelectItem>
                        <SelectItem value="status-desc">Status: Aktif Dulu</SelectItem>
                        <SelectItem value="status-asc">Status: Tidak Aktif Dulu</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}