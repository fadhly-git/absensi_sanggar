<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\ExportOrderRequest;
use App\Http\Requests\Event\StoreOrderRequest;
use App\Http\Requests\Event\UpdateOrderRequest;
use App\Http\Requests\Event\UpdateOrderStatusRequest;
use App\Http\Resources\Event\OrderCollection;
use App\Http\Resources\Event\OrderResource;
use App\Models\Orders;
use App\Models\Products;
use App\Models\Siswa;
use App\Services\Event\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {
    }

    public function index(Request $request)
    {
        return Inertia::render('event/orders/index', [
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    public function apiIndex(Request $request)
    {
        $filters = $request->only(['status', 'search', 'date_from', 'date_to', 'has_proof']);

        // Tambahkan per_page kalau mau support dynamic
        $perPage = $request->integer('per_page', 10);

        $orders = $this->orderService->getPaginated(
            perPage: $perPage,
            filters: $filters
        );

        return new OrderCollection($orders);
    }

    public function apiStore(StoreOrderRequest $request)
    {
        $order = $this->orderService->create($request->validated());
        return new OrderResource($order);
    }

    public function apiShow(Orders $order)
    {
        $order->load(['items.product', 'siswas.user']);
        return new OrderResource($order);
    }

    public function apiUpdate(UpdateOrderRequest $request, Orders $order)
    {
        $order = $this->orderService->update($order, $request->validated());
        return new OrderResource($order);
    }

    public function apiUpdateStatus(UpdateOrderStatusRequest $request, Orders $order)
    {
        try {
            $order = $this->orderService->updateStatus($order, $request->validated()['status']);
            return new OrderResource($order);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengubah status order'], 500);
        }
    }

    public function apiDestroy(Orders $order)
    {
        try {
            $this->orderService->delete($order);
            return response()->json(['message' => 'Order berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus order'], 500);
        }
    }

    public function apiStatistics()
    {
        return response()->json($this->orderService->getStatistics());
    }

    public function apiStudents(Request $request)
    {
        $search = $request->input('search', '');

        $students = Siswa::with('user')
            ->whereHas('user', function ($q) use ($search) {
                if ($search) {
                    $q->where('name', 'like', "%{$search}%");
                }
            })
            ->aktif()
            ->limit(20)
            ->get()
            ->map(fn($siswa) => [
                'id' => $siswa->id,
                'name' => $siswa->user?->name ?? 'Unknown',
                'status' => $siswa->status_text,
            ]);

        return response()->json($students);
    }

    public function apiProducts()
    {
        $products = Products::with('sizeCharts')
            ->where('is_active', true)
            ->get()
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'image_url' => $product->image_url,
                'size_charts' => $product->sizeCharts->map(fn($sc) => [
                    'id' => $sc->id,
                    'category' => $sc->category,
                    'category_label' => $sc->category === 'kids' ? 'Anak' : 'Dewasa',
                    'size_label' => $sc->size_label,
                    'width_cm' => $sc->width_cm,
                    'length_cm' => $sc->length_cm,
                    'price_short_sleeve' => $sc->price_short_sleeve,
                    'price_long_sleeve' => $sc->price_long_sleeve,
                ]),
            ]);

        return response()->json($products);
    }

    public function export(ExportOrderRequest $request)
    {
        try {
            $filters = $request->only(['status', 'date_from', 'date_to']);
            $type = $request->input('type', 'full');

            return $this->orderService->exportToExcel($filters, $type);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengekspor data order'], 500);
        }
    }
}
