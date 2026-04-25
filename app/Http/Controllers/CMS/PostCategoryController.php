<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\PostCategory;
use Illuminate\Http\Request;

class PostCategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(Request $request)
    {
        $query = PostCategory::withCount('posts')->ordered();

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->boolean('all')) {
            return response()->json([
                'success' => true,
                'data' => $query->get(),
            ]);
        }

        $categories = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    /**
     * Create new category
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:post_categories,name',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        try {
            $category = PostCategory::create([
                'name' => $request->name,
                'description' => $request->description,
                'color' => $request->color ?? '#3b82f6',
                'order' => PostCategory::max('order') + 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil ditambahkan',
                'data' => $category,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan kategori: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update category
     */
    public function update(Request $request, PostCategory $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:post_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        try {
            $category->update($request->only(['name', 'description', 'color']));

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil diupdate',
                'data' => $category,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate kategori: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete category
     */
    public function destroy(PostCategory $category)
    {
        try {
            // Check if category has posts
            if ($category->posts()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kategori tidak bisa dihapus karena masih memiliki ' . $category->posts()->count() . ' artikel',
                ], 422);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus kategori: ' . $e->getMessage(),
            ], 500);
        }
    }
}
