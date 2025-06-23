<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use App\Models\Keuangan;

class FinancialSheetExport implements FromQuery, WithTitle, WithHeadings, WithMapping, WithStyles, WithColumnFormatting
{
    protected $type;
    protected $date;
    protected $params;
    protected $title;
    protected $color;

    public function __construct($type, $date, $params, $title, $color)
    {
        $this->type = $type;
        $this->date = $date;
        $this->params = $params;
        $this->title = $title;
        $this->color = $color;
    }

    public function title(): string
    {
        return $this->title;
    }

    public function query()
    {
        if ($this->type === 'masuk') {
            return Keuangan::getUangMasukByDateQuery($this->date, $this->params);
        }
        return Keuangan::getUangKeluarByDateQuery($this->date, $this->params);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Tanggal',
            'Keterangan',
            'Jumlah (Rp)'
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->tanggal,
            $transaction->keterangan,
            $transaction->jumlah
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['argb' => $this->color]
                ]
            ],
            'A:D' => ['autoSize' => true]
        ];
    }

    public function columnFormats(): array
    {
        return [
            'D' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
        ];
    }
}
