<?php

namespace App\Exports\Event;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\Exportable;

class OrdersMultiSheetExport implements WithMultipleSheets
{
    use Exportable;

    protected array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        return [
            new OrdersExport($this->filters),
            new OrdersSummaryExport($this->filters),
        ];
    }
}
