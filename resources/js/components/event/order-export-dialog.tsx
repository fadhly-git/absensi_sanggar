import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
}

type ExportType = 'full' | 'detail' | 'summary';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Pembayaran' },
    { value: 'paid', label: 'Sudah Dibayar' },
    { value: 'processing', label: 'Diproses' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

const EXPORT_TYPES: { value: ExportType; label: string; description: string }[] = [
    {
        value: 'full',
        label: 'Lengkap (2 Sheet)',
        description: 'Detail pesanan + Rekap per ukuran',
    },
    {
        value: 'detail',
        label: 'Detail Pesanan',
        description: 'Semua data pesanan lengkap',
    },
    {
        value: 'summary',
        label: 'Rekap Ukuran',
        description: 'Ringkasan jumlah per ukuran (untuk vendor)',
    },
];

export function OrderExportDialog({ open, onClose }: ExportDialogProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<ExportType>('full');
    const [status, setStatus] = useState<OrderStatus | 'all'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            params.append('type', exportType);
            if (status !== 'all') params.append('status', status);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            window.location.href = `/atmin/event/orders/export?${params.toString()}`;
            setTimeout(() => {
                setIsExporting(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error exporting orders:', error);
            setIsExporting(false);
        }
    }

    const handleReset = () => {
        setExportType('full');
        setStatus('all');
        setDateFrom('');
        setDateTo('');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet />
                        Ekspor Data Pesanan
                    </DialogTitle>
                    <DialogDescription>
                        Pilih format dan filter untuk mengekspor data pesanan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Export Type */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Tipe Ekspor</Label>
                        <RadioGroup
                            value={exportType}
                            onValueChange={(value) => setExportType(value as ExportType)}
                            className="space-y-2"
                        >
                            {EXPORT_TYPES.map((type) => (
                                <Label
                                    key={type.value}
                                    htmlFor={type.value}
                                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                        exportType === type.value
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <RadioGroupItem
                                        value={type.value}
                                        id={type.value}
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{type.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {type.description}
                                        </p>
                                    </div>
                                </Label>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Filter Status</Label>
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as OrderStatus | 'all')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Dari Tanggal</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Sampai Tanggal</Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                min={dateFrom}
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            <strong>Tips:</strong> Untuk keperluan vendor/konveksi, gunakan
                            tipe "Rekap Ukuran" agar mudah melihat total pesanan per
                            ukuran.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full sm:w-auto"
                    >
                        Reset Filter
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isExporting}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full sm:flex-1"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Mengunduh...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Excel
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
