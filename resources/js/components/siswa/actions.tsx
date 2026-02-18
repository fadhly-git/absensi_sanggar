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
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex gap-2 items-center flex-1 sm:flex-none">
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
            </div>

            <div className="hidden sm:flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="px-3">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
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
                            Export Data Terfilter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDownloadTemplate}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Template
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-shrink-0">
                <Button size="sm" onClick={onAdd} disabled={isAnyLoading} className="px-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah
                </Button>
            </div>
        </div>
    );
}

export default SiswaActions;
