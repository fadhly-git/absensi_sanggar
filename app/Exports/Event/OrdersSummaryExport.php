<?php

namespace App\Exports\Event;

use App\Models\Orders;
use App\Models\OrderItems;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class OrdersSummaryExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    WithTitle,
    ShouldAutoSize,
    WithColumnWidths
{

    protected array $filters;
    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection(): Collection
    {
        $query = OrderItems::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.status', ['pending', 'paid', 'processing', 'completed']);
        if (!empty($this->filters['status'])) {
            $query->where('orders.status', $this->filters['status']);
        }
        if (!empty($this->filters['date_from'])) {
            $query->whereDate('orders.created_at', '>=', $this->filters['date_from']);
        }
        if (!empty($this->filters['date_to'])) {
            $query->whereDate('orders.created_at', '<=', $this->filters['date_to']);
        }

        $summary = $query
            ->selectRaw('
                    order_items.category,
                    order_items.size_label,
                    order_items.sleeve_type,
                    order_items.width_cm,
                    order_items.length_cm,
                    SUM(order_items.quantity) as total_qty,
                    SUM(order_items.subtotal) as total_amount
                ')
            ->groupBy([
                'order_items.category',
                'order_items.size_label',
                'order_items.sleeve_type',
                'order_items.width_cm',
                'order_items.length_cm'
            ])
            ->orderBy('order_items.category')
            ->orderBy('order_items.size_label')
            ->orderBy('order_items.sleeve_type')
            ->get();

        $sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL'];
        $summary = $summary->sortBy([
            ['category', 'asc'],
            ['sleeve_type', 'asc'],
            fn($a, $b) => (array_search(strtoupper($a->size_label), $sizeOrder) ?? 999)
                        <=> (array_search(strtoupper($b->size_label), $sizeOrder) ?? 999)
        ]);

        $rows = collect();
        $no = 0;

        foreach ($summary as $item) {
            $no++;
            $rows->push([
                'no' => $no,
                'category_label' => $item->category === 'kids' ? 'Anak' : 'Dewasa',
                'size_label' => $item->size_label,
                'sleeve_type_label' => $item->sleeve_type === 'long' ? 'Panjang' : 'Pendek',
                'total_qty' => $item->total_qty,
            ]);
        }

        // add total row
        $rows->push([
            '',
            '',
            '',
            'Total',
            $summary->sum('total_qty'),
        ]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            'No',
            'Kategori',
            'Ukuran',
            'Lengan',
            'Total Qty',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();

        return [
            // Header style
            1 => [
                'font' => ['bold' => true],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFCCCCCC'],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ],
            // Total row style
            $lastRow => [
                'font' => ['bold' => true],
                'borders' => [
                    'top' => [
                        'borderStyle' => Border::BORDER_DOUBLE,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ],

            "A1:E{$lastRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ],

            // center alignment for specific columns
            'A' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'D' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'E' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,
            'B' => 15,
            'C' => 10,
            'D' => 15,
            'E' => 12,
        ];
    }

    public function title(): string
    {
        return 'Rekap per ukuran';
    }
}
