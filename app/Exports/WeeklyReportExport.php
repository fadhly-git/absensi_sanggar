<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class WeeklyReportExport implements FromCollection, WithHeadings, WithStyles
{
    protected $data;

    // Constructor untuk menerima data dari controller
    public function __construct(Collection $data)
    {
        $this->data = $data;
    }

    /**
     * Return data collection for export.
     */
    public function collection()
    {
        return $this->data;
    }

    /**
     * Define the headings for the Excel file.
     */
    public function headings(): array
    {
        return [
            'Siswa ID',
            'Nama Siswa',
            'Alamat',
            'Status',
            'Minggu 1',
            'Minggu 2',
            'Minggu 3',
            'Minggu 4',
            'Minggu 5',
        ];
    }

    /**
     * Apply styles to the worksheet.
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Styling header row
            1 => ['font' => ['bold' => true]],
        ];
    }
}
