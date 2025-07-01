<?php

namespace App\Exports;

use App\Models\Siswa;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class SiswaExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        try {
            $query = Siswa::query();

            // Apply filters - Perbaiki filter logic
            if (!empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', '%' . $search . '%')
                        ->orWhere('alamat', 'like', '%' . $search . '%');
                });
            }

            if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
                $status = $this->filters['status'] === '1' || $this->filters['status'] === 'aktif' ? 1 : 0;
                $query->where('status', $status);
            }

            // Apply sorting
            $sortBy = $this->filters['sortBy'] ?? 'nama';
            $sortOrder = $this->filters['sortOrder'] ?? 'asc';

            $allowedSortFields = ['nama', 'alamat', 'created_at', 'status'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            }

            return $query->get();

        } catch (\Exception $e) {
            \Log::error('Error in SiswaExport collection: ' . $e->getMessage());
            // Return empty collection if error
            return collect([]);
        }
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'No',
            'Nama Siswa',
            'Alamat',
            'Status',
            'Tanggal Daftar',
            'Terakhir Update'
        ];
    }

    /**
     * @param mixed $siswa
     * @return array
     */
    public function map($siswa): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $siswa->nama ?? '',
            $siswa->alamat ?? '',
            $siswa->status ? 'Aktif' : 'Non-Aktif',
            $siswa->created_at ? $siswa->created_at->format('d/m/Y H:i') : '-',
            $siswa->updated_at ? $siswa->updated_at->format('d/m/Y H:i') : '-'
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style untuk header
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => Color::COLOR_WHITE],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => '366092'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Data Siswa Sanggar';
    }
}