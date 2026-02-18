<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StorePublicOrderRequest;
use App\Http\Resources\Event\OrderResource;
use App\Services\Event\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {
    }

    /**
     * Store new order
     */
    public function store(StorePublicOrderRequest $request): JsonResponse
    {
        try {
            // Check if PO deadline has passed
            $product = \App\Models\Products::find($request->input('product_id'));
            if ($product && $product->po_deadline && now()->isAfter($product->po_deadline)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pre-order telah ditutup. Pesanan baru tidak dapat dibuat.',
                ], 403);
            }

            $order = $this->orderService->create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => new OrderResource($order),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save or update draft
     */
    public function saveDraft(StorePublicOrderRequest $request): JsonResponse
    {
        try {
            // Check if PO deadline has passed
            $product = \App\Models\Products::find($request->input('product_id'));
            if ($product && $product->po_deadline && now()->isAfter($product->po_deadline)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pre-order telah ditutup. Draft tidak dapat disimpan.',
                ], 403);
            }

            $draftCode = $request->input('draft_code');
            $draft = $this->orderService->saveDraft($request->all(), $draftCode);

            return response()->json([
                'success' => true,
                'message' => 'Draft berhasil disimpan. Anda bisa melanjutkan nanti.',
                'data' => new OrderResource($draft),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan draft: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get buyer's drafts
     */
    public function getDrafts(Request $request): JsonResponse
    {
        $request->validate([
            'buyer_id' => 'required|string',
            'buyer_type' => 'required|in:student,guest',
        ]);

        $buyerId = $request->input('buyer_id');
        $buyerType = $request->input('buyer_type');

        $drafts = $this->orderService->getDraftsByBuyer($buyerId, $buyerType);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($drafts),
        ]);
    }

    /**
     * Convert draft to final order
     */
    public function checkoutDraft(string $draftCode): JsonResponse
    {
        try {
            $draft = $this->orderService->findByInvoice($draftCode);

            if (!$draft) {
                return response()->json([
                    'success' => false,
                    'message' => 'Draft tidak ditemukan.',
                ], 404);
            }

            // Check if PO deadline has passed
            if ($draft->product && $draft->product->po_deadline && now()->isAfter($draft->product->po_deadline)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pre-order telah ditutup. Draft tidak dapat di-checkout.',
                ], 403);
            }

            $order = $this->orderService->convertDraftToOrder($draft);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat!',
                'data' => new OrderResource($order),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(string $invoiceCode): JsonResponse
    {
        $order = $this->orderService->findByInvoice($invoiceCode);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Mark invoice as viewed (for first time view tracking)
     */
    public function markAsViewed(string $invoiceCode): JsonResponse
    {
        $order = $this->orderService->findByInvoice($invoiceCode);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        // Update is_first_view to false
        $order->update(['is_first_view' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice marked as viewed.',
        ]);
    }

    /**
     * Get orders by buyer (for invoice history)
     */
    public function getByBuyer(Request $request): JsonResponse
    {
        $request->validate([
            'buyer_id' => 'required|string',
            'buyer_type' => 'required|in:student,guest',
        ]);

        $buyerId = $request->input('buyer_id');
        $buyerType = $request->input('buyer_type');

        $orders = $this->orderService->getByBuyer($buyerId, $buyerType);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
        ]);
    }

    /**
     * Search orders by buyer name/phone
     */
    public function searchByBuyer(Request $request): JsonResponse
    {
        $request->validate([
            'search_type' => 'required|in:student,guest',
            'name' => 'required_if:search_type,student|string|max:255',
            'phone' => 'required_if:search_type,guest|string|max:20',
        ]);

        $searchType = $request->input('search_type');
        $name = $request->input('name');
        $phone = $request->input('phone');

        $query = \App\Models\Orders::query();

        if ($searchType === 'student') {
            // Search by student name
            $query->whereNotNull('student_id')
                  ->whereHas('student', function ($q) use ($name) {
                      $q->where('name', 'like', '%' . $name . '%');
                  });
        } else {
            // Search by guest name and phone
            $query->whereNull('student_id')
                  ->where('guest_name', 'like', '%' . $name . '%')
                  ->where('guest_phone', 'like', '%' . $phone . '%');
        }

        $orders = $query->latest()->take(10)->get();

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
        ]);
    }

    public function uploadPaymentProof(Request $request, string $invoiceCode): JsonResponse
    {
        try {
            $request->validate([
                'payment_proof' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            ], [
                'payment_proof.required' => 'Bukti pembayaran wajib diupload.',
                'payment_proof.image' => 'File harus berupa gambar.',
                'payment_proof.mimes' => 'Format gambar harus JPG, JPEG, atau PNG.',
                'payment_proof.max' => 'Ukuran file maksimal 2MB.',
            ]);

            $order = $this->orderService->findByInvoice($invoiceCode);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesanan tidak ditemukan.',
                ], 404);
            }

            if (!in_array($order->status, ['pending'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bukti pembayaran hanya bisa diupload untuk pesanan dengan status menunggu pembayaran.',
                ], 400);
            }

            // Store new proof
            $path = $request->file('payment_proof')->store('payment-proofs', 'public');

            $order->update(['payment_proof' => $path]);

            return response()->json([
                'success' => true,
                'message' => 'Bukti pembayaran berhasil diupload. Silakan tunggu konfirmasi dari admin.',
                'data' => [
                    'payment_proof_url' => url('storage/' . $path),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload bukti pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete order (only owner can delete, only pending status, before deadline)
     */
    public function destroy(Request $request, string $invoiceCode): JsonResponse
    {
        try {
            // Validate ownership data
            $validated = $request->validate([
                'buyer_type' => 'required|in:student,guest',
                'buyer_id' => 'required_if:buyer_type,student',
                'guest_name' => 'required_if:buyer_type,guest|string',
                'guest_phone' => 'required_if:buyer_type,guest|string',
            ]);

            $order = $this->orderService->findByInvoice($invoiceCode);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesanan tidak ditemukan.',
                ], 404);
            }

            // Check if PO deadline has passed
            if ($order->product && $order->product->po_deadline && now()->isAfter($order->product->po_deadline)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pre-order telah ditutup. Pesanan tidak dapat dihapus.',
                ], 403);
            }

            // Delete with validation in service layer
            $this->orderService->deleteByOwner($order, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'tidak memiliki akses') ? 403 : 400;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }
}
