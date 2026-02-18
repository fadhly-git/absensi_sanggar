<?php

namespace App\Services\Event;

use App\Models\Products;
use App\Models\SizeCharts;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class ProductService
{
    /**
     * Mengambil semua data dengan paginasi.
     */
    public function getAllProducts($perPage = 10)
    {
        return Products::with('sizeCharts')->paginate($perPage);
    }

    /**
     * Logic menyimpan produk beserta size chart-nya.
     */

    public function createProduct(array $data)
    {
        return DB::transaction(function () use ($data) {
            // handle jika ada upload gambar
            $imagePath = null;
            if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
                $imagePath = $data['image']->store('products', 'public');
            }

            $product = Products::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'image_url' => $imagePath,
                'is_active' => true,
                'po_deadline' => $data['po_deadline'],
            ]);

            foreach ($data['size_charts'] as $chart) {
                $product->sizeCharts()->create([
                    'category' => $chart['category'],
                    'size_label' => $chart['size_label'],
                    'width_cm' => $chart['width_cm'],
                    'length_cm' => $chart['length_cm'],
                    'price_short_sleeve' => $chart['price_short_sleeve'],
                    'price_long_sleeve' => $chart['price_long_sleeve'],
                ]);
            }
            return $product;
        });
    }

    public function updateProduct($id, array $data)
    {
        return DB::transaction(function () use ($data, $id) {
            $product = Products::findOrFail($id);
            // handle jika ada upload gambar
            if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
                if ($product->image_url) {
                    Storage::disk('public')->delete($product->image_url);
                }
                $product->image_url = $data['image']->store('products', 'public');
            }

            $product->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => true,
                'po_deadline' => $data['po_deadline'],
            ]);

            $product->sizeCharts()->delete();

            foreach ($data['size_charts'] as $chart) {
                $product->sizeCharts()->create([
                    'category' => $chart['category'],
                    'size_label' => $chart['size_label'],
                    'width_cm' => $chart['width_cm'],
                    'length_cm' => $chart['length_cm'],
                    'price_short_sleeve' => $chart['price_short_sleeve'],
                    'price_long_sleeve' => $chart['price_long_sleeve'],
                ]);
            }
            return $product;
        });
    }

    public function deleteProduct($id)
    {
        $product = Products::findOrFail($id);
        // Hapus gambar dari storage jika ada
        if ($product->image_url) {
            Storage::disk('public')->delete($product->image_url);
        }
        $product->delete();
    }
}
