<?php
// app/Services/Event/OrderService.php

namespace App\Services\Event;

use App\Models\Orders;
use App\Models\OrderItems;
use App\Models\SizeCharts;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OrderService
{
    public function getPaginated(int $perPage = 10, array $filters = []): LengthAwarePaginator
    {
        $query = Orders::with(['items.product', 'siswas.user'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%")
                    ->orWhere('guest_name', 'like', "%{$search}%")
                    ->orWhereHas('siswas.user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (isset($filters['has_proof'])) {
            if ($filters['has_proof'] === '1') {
                $query->whereNotNull('payment_proof');
            } elseif ($filters['has_proof'] === '0') {
                $query->whereNull('payment_proof');
            }
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Orders
    {
        return Orders::with(['items.product', 'siswas.user'])->find($id);
    }

    public function findByInvoice(string $invoiceCode): ?Orders
    {
        return Orders::with(['items.product', 'siswas.user'])
            ->where('invoice_code', $invoiceCode)
            ->first();
    }

    public function create(array $data): Orders
    {
        return DB::transaction(function () use ($data) {
            $invoiceCode = $this->generateInvoiceCode();
            $totalAmount = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $sizeChart = SizeCharts::findOrFail($item['size_chart_id']);
                $price = $item['sleeve_type'] === 'long'
                    ? $sizeChart->price_long_sleeve
                    : $sizeChart->price_short_sleeve;
                $subtotal = $price * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'size_label' => $sizeChart->size_label,
                    'category' => $sizeChart->category,
                    'sleeve_type' => $item['sleeve_type'],
                    'width_cm' => $sizeChart->width_cm,
                    'length_cm' => $sizeChart->length_cm,
                    'price_at_moment' => $price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            $order = Orders::create([
                'invoice_code' => $invoiceCode,
                'student_id' => $data['student_id'] ?? null,
                'guest_name' => $data['guest_name'] ?? null,
                'guest_phone' => $data['guest_phone'] ?? null,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'is_draft' => false, // Final order
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            return $order->load(['items.product', 'siswas.user']);
        });
    }

    /**
     * Save or update draft order
     */
    public function saveDraft(array $data, ?string $draftCode = null): Orders
    {
        return DB::transaction(function () use ($data, $draftCode) {
            // Find existing draft or create new
            if ($draftCode) {
                $order = Orders::where('invoice_code', $draftCode)
                    ->where('is_draft', true)
                    ->first();

                if ($order) {
                    // Update existing draft
                    $order->items()->delete();
                } else {
                    // Draft not found, create new
                    $draftCode = $this->generateDraftCode();
                }
            } else {
                $draftCode = $this->generateDraftCode();
            }

            $totalAmount = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $sizeChart = SizeCharts::findOrFail($item['size_chart_id']);
                $price = $item['sleeve_type'] === 'long'
                    ? $sizeChart->price_long_sleeve
                    : $sizeChart->price_short_sleeve;
                $subtotal = $price * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'size_label' => $sizeChart->size_label,
                    'category' => $sizeChart->category,
                    'sleeve_type' => $item['sleeve_type'],
                    'width_cm' => $sizeChart->width_cm,
                    'length_cm' => $sizeChart->length_cm,
                    'price_at_moment' => $price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            if (!isset($order)) {
                $order = Orders::create([
                    'invoice_code' => $draftCode,
                    'student_id' => $data['student_id'] ?? null,
                    'guest_name' => $data['guest_name'] ?? null,
                    'guest_phone' => $data['guest_phone'] ?? null,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'is_draft' => true,
                ]);
            } else {
                $order->update([
                    'student_id' => $data['student_id'] ?? null,
                    'guest_name' => $data['guest_name'] ?? null,
                    'guest_phone' => $data['guest_phone'] ?? null,
                    'total_amount' => $totalAmount,
                ]);
            }

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            return $order->load(['items.product', 'siswas.user']);
        });
    }

    /**
     * Convert draft to final order
     */
    public function convertDraftToOrder(Orders $draft): Orders
    {
        if (!$draft->is_draft) {
            throw new \Exception('Order ini bukan draft.');
        }

        return DB::transaction(function () use ($draft) {
            $invoiceCode = $this->generateInvoiceCode();

            $draft->update([
                'invoice_code' => $invoiceCode,
                'is_draft' => false,
            ]);

            return $draft->fresh(['items.product', 'siswas.user']);
        });
    }

    /**
     * Get buyer's draft orders
     */
    public function getDraftsByBuyer(string $buyerId, string $buyerType): \Illuminate\Database\Eloquent\Collection
    {
        $query = Orders::with(['items.product', 'siswas.user'])
            ->where('is_draft', true)
            ->orderBy('updated_at', 'desc')
            ->limit(5);

        if ($buyerType === 'student') {
            $query->where('student_id', $buyerId);
        } else {
            $query->where('guest_phone', $buyerId);
        }

        return $query->get();
    }

    public function update(Orders $order, array $data): Orders
    {
        return DB::transaction(function () use ($order, $data) {
            $orderData = [
                'student_id' => $data['student_id'] ?? null,
                'guest_name' => $data['guest_name'] ?? null,
                'guest_phone' => $data['guest_phone'] ?? null,
            ];

            if (isset($data['status'])) {
                $orderData['status'] = $data['status'];
            }

            if (isset($data['items'])) {
                $existingItemIds = [];
                $totalAmount = 0;

                foreach ($data['items'] as $item) {
                    $sizeChart = SizeCharts::findOrFail($item['size_chart_id']);
                    $price = $item['sleeve_type'] === 'long'
                        ? $sizeChart->price_long_sleeve
                        : $sizeChart->price_short_sleeve;
                    $subtotal = $price * $item['quantity'];
                    $totalAmount += $subtotal;

                    $itemData = [
                        'product_id' => $item['product_id'],
                        'size_label' => $sizeChart->size_label,
                        'category' => $sizeChart->category,
                        'sleeve_type' => $item['sleeve_type'],
                        'width_cm' => $sizeChart->width_cm,
                        'length_cm' => $sizeChart->length_cm,
                        'price_at_moment' => $price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ];

                    if (!empty($item['id'])) {
                        $orderItem = OrderItems::find($item['id']);
                        if ($orderItem && $orderItem->order_id === $order->id) {
                            $orderItem->update($itemData);
                            $existingItemIds[] = $orderItem->id;
                        }
                    } else {
                        $newItem = $order->items()->create($itemData);
                        $existingItemIds[] = $newItem->id;
                    }
                }

                $order->items()->whereNotIn('id', $existingItemIds)->delete();
                $orderData['total_amount'] = $totalAmount;
            }

            $order->update($orderData);

            return $order->fresh(['items.product', 'siswas.user']);
        });
    }

    public function updateStatus(Orders $order, string $status): Orders
    {
        $order->update(['status' => $status]);
        return $order->fresh(['items.product', 'siswas.user']);
    }

    public function delete(Orders $order): bool
    {
        return DB::transaction(function () use ($order) {
            $order->items()->delete();
            return $order->delete();
        });
    }

    /**
     * Delete order with ownership and deadline validation
     */
    public function deleteByOwner(Orders $order, array $ownerData): bool
    {
        // Validate ownership
        $this->validateOwnership($order, $ownerData);

        // Validate status - only pending can be deleted
        if ($order->status !== 'pending') {
            throw new \Exception('Hanya pesanan dengan status pending yang dapat dihapus.');
        }

        // Validate deadline
        $this->validateDeadline($order);

        return $this->delete($order);
    }

    /**
     * Validate order ownership
     */
    private function validateOwnership(Orders $order, array $ownerData): void
    {
        $buyerType = $ownerData['buyer_type'];

        if ($buyerType === 'student') {
            $buyerId = $ownerData['buyer_id'] ?? null;
            if ($order->student_id != $buyerId) {
                throw new \Exception('Anda tidak memiliki akses untuk menghapus pesanan ini.');
            }
        } else {
            $guestName = $ownerData['guest_name'] ?? null;
            $guestPhone = $ownerData['guest_phone'] ?? null;
            if ($order->guest_name !== $guestName || $order->guest_phone !== $guestPhone) {
                throw new \Exception('Anda tidak memiliki akses untuk menghapus pesanan ini.');
            }
        }
    }

    /**
     * Validate PO deadline
     */
    private function validateDeadline(Orders $order): void
    {
        $product = $order->items->first()?->product;

        if ($product && $product->po_deadline) {
            $deadline = \Carbon\Carbon::parse($product->po_deadline);
            if (now()->isAfter($deadline)) {
                throw new \Exception('Deadline sudah lewat, pesanan tidak dapat dihapus.');
            }
        }
    }

    public function getStatistics(): array
    {
        $stats = Orders::selectRaw('
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN status = "paid" THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN status = "processing" THEN 1 ELSE 0 END) as processing_count,
            SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_count,
            SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_count,
            SUM(CASE WHEN status IN ("paid", "processing", "completed") THEN total_amount ELSE 0 END) as total_revenue
        ')->first();

        return [
            'total_orders' => $stats->total_orders ?? 0,
            'pending_count' => $stats->pending_count ?? 0,
            'paid_count' => $stats->paid_count ?? 0,
            'processing_count' => $stats->processing_count ?? 0,
            'completed_count' => $stats->completed_count ?? 0,
            'cancelled_count' => $stats->cancelled_count ?? 0,
            'total_revenue' => $stats->total_revenue ?? 0,
        ];
    }

    public function getByBuyer(string $buyerId, string $buyerType): \Illuminate\Database\Eloquent\Collection
    {
        $query = Orders::with(['items.product', 'siswas.user'])
            ->orderBy('created_at', 'desc')
            ->limit(10); // Last 10 orders

        if ($buyerType === 'student') {
            $query->where('student_id', $buyerId);
        } else {
            $query->where('guest_phone', $buyerId);
        }

        return $query->get();
    }

    public function getForExport(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = Orders::with(['items.product', 'siswas.user'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->get();
    }

    private function generateInvoiceCode(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        $code = "{$prefix}-{$date}-{$random}";

        while (Orders::where('invoice_code', $code)->exists()) {
            $random = strtoupper(Str::random(4));
            $code = "{$prefix}-{$date}-{$random}";
        }

        return $code;
    }

    private function generateDraftCode(): string
    {
        $prefix = 'DRAFT';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        $code = "{$prefix}-{$date}-{$random}";

        while (Orders::where('invoice_code', $code)->exists()) {
            $random = strtoupper(Str::random(4));
            $code = "{$prefix}-{$date}-{$random}";
        }

        return $code;
    }

    public function exportToExcel(array $filters = [], string $type = 'full'): BinaryFileResponse
    {
        $fileName = 'pesanan-' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        return match ($type) {
            'summary' => Excel::download(new \App\Exports\Event\OrdersSummaryExport($filters), "rekap-ukuran-{$fileName}"),
            'detail' => Excel::download(new \App\Exports\Event\OrdersExport($filters), "detail-pesanan-{$fileName}"),
            default => Excel::download(new \App\Exports\Event\OrdersExport($filters), $fileName),
        };
    }
}
