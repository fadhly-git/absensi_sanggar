<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\OrderCollection;
use App\Http\Resources\Event\OrderResource;
use App\Models\Orders;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentProofController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('event/payment-proofs', [
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to', 'has_proof']),
        ]);
    }

    public function apiIndex(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $hasProof = $request->input('has_proof');

        $query = Orders::with(['siswas.user', 'items.product']);

        // Filter berdasarkan has_proof
        if ($request->filled('has_proof')) {
            if ($hasProof === '1') {
                $query->whereNotNull('payment_proof')
                    ->where('payment_proof', '!=', '');
            }

            if ($hasProof === '0') {
                $query->where(function ($q) {
                    $q->whereNull('payment_proof')
                    ->orWhere('payment_proof', '');
                });
            }
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%")
                    ->orWhereHas('siswas.user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $query->latest()->paginate($perPage);

        return new OrderCollection($orders);
    }

    public function apiVerify(Request $request, Orders $order)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,processing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        try {
            $order->update([
                'status' => $request->status,
                'payment_verified_at' => $request->status === 'paid' ? now() : $order->payment_verified_at,
                'payment_notes' => $request->notes,
            ]);

            $order->load(['siswas.user', 'items.product']);

            return new OrderResource($order);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memverifikasi pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }
}
