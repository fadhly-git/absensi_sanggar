<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Get all pages
     */
    public function index()
    {
        $pages = Page::with('updater:id,name')->get();

        return response()->json([
            'success' => true,
            'data' => $pages,
        ]);
    }

    /**
     * Get single page by key
     */
    public function show(string $pageKey)
    {
        $page = Page::getByKey($pageKey);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }

    /**
     * Update page
     */
    public function update(Request $request, string $pageKey)
    {
        $page = Page::getByKey($pageKey);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'sections' => 'required|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        try {
            $page->update([
                'title' => $request->title,
                'sections' => $request->sections,
                'meta_title' => $request->meta_title,
                'meta_description' => $request->meta_description,
                'meta_keywords' => $request->meta_keywords,
                'updated_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Halaman berhasil diupdate',
                'data' => $page,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate halaman: ' . $e->getMessage(),
            ], 500);
        }
    }
}
