<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\Keuangan;

class FinancialSummarySheet implements FromCollection, WithTitle, WithHeadings, WithStyles
{
    protected $date;
    protected $params;

    public function __construct($date, $params)
    {
        $this->date = $date;
        $this->params = $params;
    }

    public function title(): string
    {
        return 'Rekapitulasi';
    }

    public function collection()
    {
        $totalMasuk = Keuangan::getTotalByType('masuk', $this->date, $this->params);
        $totalKeluar = Keuangan::getTotalByType('keluar', $this->date, $this->params);
        $saldo = $totalMasuk - $totalKeluar;

        return collect([
            ['Total Pemasukan', $totalMasuk],
            ['Total Pengeluaran', $totalKeluar],
            ['Saldo', $saldo]
        ]);
    }

    public function headings(): array
    {
        return [
            'Keterangan',
            'Jumlah (Rp)'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['argb' => 'FF0070C0']
                ]
            ],
            'A:B' => ['autoSize' => true],
            4 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['argb' => 'FFFFFF00']
                ]
            ]
        ];
    }
}
