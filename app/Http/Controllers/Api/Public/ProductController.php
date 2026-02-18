<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\ProductResource;
use App\Models\Products;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get All active products
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $products = Products::with([
                'sizeCharts' => function ($query) {
                    $query->orderByRaw("
                        FIELD(category, 'kids', 'adult'),
                        CASE size_label
                            WHEN 'XS' THEN 1
                            WHEN 'S' THEN 2
                            WHEN 'M' THEN 3
                            WHEN 'L' THEN 4
                            WHEN 'XL' THEN 5
                            WHEN 'XXL' THEN 6
                            ELSE 7
                        END
                    ");
                }
            ])
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * get single product detail
     */
    public function show(int $id): JsonResponse
    {
        try {
            $product = Products::with([
                'sizeCharts' => function ($query) {
                    $query->orderByRaw("
                    FIELD(category, 'kids', 'adult'),
                    CASE size_label
                        WHEN 'XS' THEN 1
                        WHEN 'S' THEN 2
                        WHEN 'M' THEN 3
                        WHEN 'L' THEN 4
                        WHEN 'XL' THEN 5
                        WHEN 'XXL' THEN 6
                        ELSE 7
                    END
                ");
                }
            ])
                ->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => new ProductResource($product),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product: ' . $e->getMessage(),
            ], 500);
        }
    }
}
