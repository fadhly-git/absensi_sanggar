<?php

namespace App\Exports\Event;

use App\Models\Orders;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class OrdersExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle,
    ShouldAutoSize
{
    protected array $filters;
    protected int $rowNumber = 0;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Orders::with(['items.product', 'siswas.user'])
            ->orderBy('created_at', 'desc');

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        $orders = $query->get();

        $rows = collect();
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $rows->push([
                    'order' => $order,
                    'item' => $item,
                ]);
            }
        }
        return $rows;
    }

    public function headings(): array
    {
        return [
            'No',
            'Invoice',
            'Tanggal Pesan',
            'Pembeli',
            'Tipe',
            'No. HP',
            'Produk',
            'Kategori',
            'Ukuran',
            'Lebar (cm)',
            'Panjang (cm)',
            'Lengan',
            'Harga Satuan',
            'Qty',
            'Subtotal',
            'Status',
        ];
    }

    public function map($row): array
    {
         $this->rowNumber++;
        $order = $row['order'];
        $item = $row['item'];

        return [
            $this->rowNumber,
            $order->invoice_code,
            $order->created_at->format('Y-m-d H:i:s'),
            $order->student_id
                ? ($order->siswas?->user->name ?? 'Siswa')
                : $order->guest_name,
            $order->student_id ? 'Siswa' : 'Tamu',
            $order->guest_phone ?? '-',
            $item->product?->name ?? 'N/A',
            // gunakan kategori yang tersimpan di order_items jika ada, fallback ke product->category
            ($item->category ?? $item->product?->category) === 'kids' ? 'Anak-anak' : 'Dewasa',
            // ambil ukuran langsung dari order_items
            !empty($item->size_label) ? $item->size_label : 'N/A',
            // width_cm / length_cm dari order_items (nullable)
            isset($item->width_cm) ? $item->width_cm : 'N/A',
            isset($item->length_cm) ? $item->length_cm : 'N/A',
            ($item->sleeve_type ?? '') === 'long' ? 'Lengan Panjang' : 'Lengan Pendek',
            'Rp ' . number_format($item->price_at_moment, 0, ',', '.'),
            $item->quantity,
            'Rp ' . number_format($item->subtotal, 0, ',', '.'),
            $this->getStatusLabel($order->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = 'P';

        return [
            // header styles
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            "A1:{$lastColumn}{$lastRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D1D5DB'],
                    ],
                ],
            ],

            // number alignment for specific columns
            'A' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'J' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'K' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'N' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],

            // currency alignment
            'M' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]],
            'O' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5, // No
            'B' => 18, // Invoice
            'C' => 18, // Tanggal Pesan
            'D' => 25, // Pembeli
            'E' => 10, // Tipe
            'F' => 15, // No. HP
            'G' => 30, // Produk
            'H' => 12, // Kategori
            'I' => 10, // Ukuran
            'J' => 12, // Lebar (cm)
            'K' => 12, // Panjang (cm)
            'L' => 15, // Lengan
            'M' => 15, // Harga Satuan
            'N' => 8,  // Qty
            'O' => 15, // Subtotal
            'P' => 15, // Status
        ];
    }

    public function title(): string
    {
        return "Data Pesanan";
    }

    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Menunggu Pembayaran',
            'paid' => 'Sudah Dibayar',
            'processing' => 'Diproses',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => 'Unknown',
        };
    }
}
