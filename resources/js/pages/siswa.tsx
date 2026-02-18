import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { SiswaStats } from '@/components/siswa/siswa-stats';
import { SiswaFiltersComponent } from '@/components/siswa/siswa-filters';
import { SiswaCardGrid } from '@/components/siswa/siswa-card-grid';
import { SiswaFormDialog } from '@/components/siswa/siswa-form-dialog';
import SiswaHeader from '@/components/siswa/header';
import SiswaActions from '@/components/siswa/actions';
import { SiswaDeleteDialog } from '@/components/siswa/siswa-delete-dialog';
import { useSiswaPage } from '@/hooks/use-siswa-page';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SiswaService } from '@/services/siswaService';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const breadcrumbs = [
    { title: 'Dashboard', href: 'atmin.dashboard' },
    { title: 'Siswa', href: 'atmin.siswa' },
];

export default function SiswaPage() {
    const { state, actions } = useSiswaPage();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Siswa" />

            <div className="p-6 space-y-8 bg-background min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <SiswaHeader
                        title="Database Siswa"
                        subtitle="Kelola dan monitoring aktivitas siswa sanggar Anda"
                    />
                    <SiswaActions
                        isLoading={state.isLoading}
                        isAnyLoading={state.isAnyLoading}
                        selectedCount={state.selectedIds.length}
                        onRefresh={actions.refetch}
                        onBulkAction={actions.handleBulkAction}
                        onExportAll={actions.handleExport.bind(null, false)}
                        onExportFiltered={actions.handleExport.bind(null, true)}
                        onImport={actions.handleImport}
                        onAdd={() => actions.setFormDialog({ open: true, siswa: null })}
                        onDownloadTemplate={() => SiswaService.downloadTemplate()}
                    />
                </div>

                <SiswaStats />

                <div className="space-y-4">
                    {/* Page controls: select all on page + per-page */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={Boolean(state.siswaData?.data && state.siswaData.data.length > 0 && state.siswaData.data.every((s: any) => state.selectedIds.includes(s.id)))}
                                onCheckedChange={() => actions.selectAllOnPage()}
                            />
                            <label className="text-sm text-muted-foreground">Pilih semua di halaman</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">Per halaman</label>
                            <div className="w-32">
                                <Select
                                    value={state.perPage === (state.siswaData?.total ?? -1) ? 'all' : String(state.perPage)}
                                    onValueChange={(v) => {
                                        if (v === 'all') {
                                            const total = state.siswaData?.total || 100;
                                            const per = Math.min(total, 100);
                                            actions.setPerPage(per);
                                            if (total > 100) {
                                                console.info('Requested all items, but server caps per_page to 100. Showing first 100 items.');
                                            }
                                        } else {
                                            actions.setPerPage(Number(v));
                                        }
                                        actions.setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Per halaman" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="48">48</SelectItem>
                                        <SelectItem value="all">Semua</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <SiswaFiltersComponent
                        filters={state.filters}
                        onFiltersChange={actions.setFilters}
                        onReset={() => actions.setFilters({ search: '', status: 'all' })}
                    />

                    <SiswaCardGrid
                        data={state.siswaData?.data || []}
                        isLoading={state.isLoading}
                        selectedIds={state.selectedIds}
                        onSelect={(id, checked) => actions.setSelectedIds(prev =>
                            checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter(x => x !== id)
                        )}
                        onEdit={(siswa) => actions.setFormDialog({ open: true, siswa })}
                        onDelete={(id) => actions.setDeleteDialog({ open: true, id })}
                    />

                    {/* Simple Professional Pagination */}
                    <div className="flex items-center justify-between border-t border-border pt-4">
                        <p className="text-sm text-muted-foreground">
                            Halaman {state.siswaData?.current_page} dari {state.siswaData?.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={state.page === 1}
                                onClick={() => actions.setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={state.page === state.siswaData?.last_page}
                                onClick={() => actions.setPage(p => p + 1)}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dialogs */}
                <SiswaFormDialog
                    open={state.formDialog.open}
                    onOpenChange={(open) => actions.setFormDialog({ open, siswa: null })}
                    siswa={state.formDialog.siswa}
                    onSubmit={actions.handleFormSubmit}
                    isLoading={state.isAnyLoading}
                />

                <SiswaDeleteDialog
                    open={state.deleteDialog.open}
                    onOpenChange={(open) => actions.setDeleteDialog({ open })}
                    siswa={null} // Bisa dioptimasi dengan mengambil data dari state.siswaData
                    onConfirm={() => state.deleteDialog.id && actions.handleDelete(state.deleteDialog.id)}
                />
            </div>
        </AppLayout>
    );
}
