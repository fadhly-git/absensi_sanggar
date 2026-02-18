<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        if (empty($this->data)) {
            return [];
        }

        // Get the first item to extract column names
        $firstItem = $this->data[0];

        $headings = [
            'Nama Siswa',
            'Alamat',
            'Status'
        ];

        // Add all date columns
        foreach ($firstItem as $key => $value) {
            if (strtotime($key)) { // Check if the key is a date
                $headings[] = $key;
            }
        }

        return $headings;
    }

    public function map($row): array
    {
        $mapped = [
            $row->siswa_nama,
            $row->siswa_alamat,
            $row->siswa_status == 1 ? 'Aktif' : 'Non-Aktif'
        ];

        // Add attendance data
        foreach ($row as $key => $value) {
            if (strtotime($key)) {
                // Extract the status from the HTML
                $status = 'Tidak';
                if (strpos($value, 'Hadir') !== false) {
                    $status = 'Hadir';
                } elseif (strpos($value, 'Bonus') !== false) {
                    $status = 'Bonus';
                }
                $mapped[] = $status;
            }
        }

        return $mapped;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true]],

            // Add conditional formatting
            'A1:Z1' => [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['argb' => 'FFD9D9D9']
                ]
            ],
        ];
    }
}
