<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreProductRequest;
use App\Services\Event\ProductService;
use App\Http\Resources\Event\ProductResource;
use Illuminate\Http\Request;

use App\Models\Products;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index()
    {
        $per_page = request()->query('per_page', 10);
        $products = $this->productService->getAllProducts($per_page);
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        try {
            $this->productService->createProduct($request->validated());
            return back()->with('success', 'Produk berhasil dibuat');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan saat membuat produk: ' . $e->getMessage());
        }
    }

    public function update(StoreProductRequest $request, $id)
    {
        try {
            $this->productService->updateProduct($id, $request->validated());
            return back()->with('success', 'Produk berhasil di update');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan saat melakukan update' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->productService->deleteProduct($id);
            return back()->with('success', 'Produk berhasil dihapus');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus produk: ' . $e->getMessage()], 500);
        }
    }
}
