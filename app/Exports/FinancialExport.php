<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\Exportable;

class FinancialExport implements WithMultipleSheets
{
    use Exportable;

    protected $date;
    protected $params;

    public function __construct($date, $params)
    {
        $this->date = $date;
        $this->params = $params;
    }

    public function sheets(): array
    {
        $sheets = [];

        // Sheet for income (masuk)
        $sheets[] = new FinancialSheetExport(
            'masuk',
            $this->date,
            $this->params,
            'Pemasukan',
            'FF00B050' // Green color
        );

        // Sheet for expenses (keluar)
        $sheets[] = new FinancialSheetExport(
            'keluar',
            $this->date,
            $this->params,
            'Pengeluaran',
            'FF0000' // Red color
        );

        // Sheet for summary
        $sheets[] = new FinancialSummarySheet(
            $this->date,
            $this->params
        );

        return $sheets;
    }
}
