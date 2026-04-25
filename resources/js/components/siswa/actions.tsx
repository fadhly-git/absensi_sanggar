import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Trash2, RefreshCw, FileDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type Props = {
    isLoading: boolean;
    isAnyLoading: boolean;
    selectedCount: number;
    onRefresh: () => void;
    onBulkAction: (action: 'activate' | 'deactivate' | 'delete') => void;
    onExportAll: () => void;
    onExportFiltered: () => void;
    onImport: () => void;
    onAdd: () => void;
    onDownloadTemplate: () => void;
};

export function SiswaActions({
    isLoading,
    isAnyLoading,
    selectedCount,
    onRefresh,
    onBulkAction,
    onExportAll,
    onExportFiltered,
    onImport,
    onAdd,
    onDownloadTemplate,
}: Props) {
    return (
        <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Refresh */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh data"
                className="px-3"
            >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Bulk action - hanya muncul jika ada yang dipilih */}
            {selectedCount > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" disabled={isAnyLoading} className="px-3">
                            Aksi ({selectedCount})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                        <DropdownMenuItem onClick={() => onBulkAction('activate')}>Aktifkan Semua</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBulkAction('deactivate')}>Nonaktifkan Semua</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onBulkAction('delete')} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Semua
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Export/Import - visible on all screen sizes */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="px-3 gap-1">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem onClick={onExportAll}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Semua Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onImport}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExportFiltered}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Terfilter
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDownloadTemplate}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Template
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Tambah */}
            <Button size="sm" onClick={onAdd} disabled={isAnyLoading} className="px-3 sm:px-4 gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah</span>
            </Button>
        </div>
    );
}

export default SiswaActions;
