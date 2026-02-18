<?php

namespace App\Http\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class OrderCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Pastikan paginator tidak append query params yang tidak perlu
        // Kita ambil nilai scalar langsung, bukan dari method yang bisa ter-contaminate
        $paginator = $this->resource; // ini LengthAwarePaginator

            return [
            'data' => OrderResource::collection($this->collection),
            'meta' => [
                'current_page' => (int) $this->currentPage(),  // paksa int
                'last_page' => (int) $this->lastPage(),
                'per_page' => (int) $this->perPage(),
                'total' => (int) $this->total(),
                'from' => (int) $this->firstItem() ?: null,
                'to' => (int) $this->lastItem() ?: null,
                // Hapus 'links' di meta kalau tidak perlu
            ],
            // Kalau mau links, gunakan:
            'links' => [
                'first' => $this->url(1),
                'last' => $this->url($this->lastPage()),
                'prev' => $this->previousPageUrl(),
                'next' => $this->nextPageUrl(),
            ],
        ];
    }

    /**
     * Tambahkan ini biar tidak ada appends bocor ke links
     */
    public function withResponse(Request $request, \Illuminate\Http\JsonResponse $response): void
    {
        // Hapus header X-Total-Count kalau ada (kadang ditambah middleware)
        $response->header('X-Total-Count', null);
    }
}
