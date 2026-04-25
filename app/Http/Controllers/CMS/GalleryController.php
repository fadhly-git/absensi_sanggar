<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\GalleryImage;
use App\Models\Media;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /**
     * Get all gallery items
     */
    public function index(Request $request)
    {
        $query = GalleryItem::with(['uploader:id,name', 'images.media'])
            ->ordered();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Only approved for non-admin
        if (!in_array(auth()->user()->role, ['admin', 'pengurus'])) {
            $query->approved();
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate($request->get('per_page', 12));

        return response()->json($items);
    }

    /**
     * Get pending gallery items for approval
     */
    public function pending(Request $request)
    {
        $items = GalleryItem::with(['uploader:id,name', 'images.media'])
            ->pending()
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 12));

        return response()->json($items);
    }

    /**
     * Get single gallery item
     */
    public function show(GalleryItem $galleryItem)
    {
        $galleryItem->load(['uploader:id,name', 'reviewer:id,name', 'images.media']);

        return response()->json([
            'success' => true,
            'data' => $galleryItem,
        ]);
    }

    /**
     * Create new gallery item
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'images' => 'required|array|min:1|max:7',
            'images.*.media_id' => 'required|exists:media,id',
            'images.*.title' => 'nullable|string|max:255',
            'images.*.description' => 'nullable|string',
        ]);

        try {
            // Determine initial status based on user role
            $status = in_array(auth()->user()->role, ['admin', 'pengurus'])
                ? 'approved'
                : 'pending';

            $galleryItem = GalleryItem::create([
                'title' => $request->title,
                'description' => $request->description,
                'status' => $status,
                'uploaded_by' => auth()->id(),
            ]);

            // Add images
            foreach ($request->images as $index => $imageData) {
                GalleryImage::create([
                    'gallery_item_id' => $galleryItem->id,
                    'media_id' => $imageData['media_id'],
                    'title' => $imageData['title'] ?? null,
                    'description' => $imageData['description'] ?? null,
                    'order' => $index,
                ]);
            }

            $galleryItem->load(['uploader:id,name', 'images.media']);

            return response()->json([
                'success' => true,
                'message' => $status === 'approved'
                    ? 'Gallery berhasil ditambahkan'
                    : 'Gallery berhasil ditambahkan dan menunggu persetujuan admin',
                'data' => $galleryItem,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan gallery: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update gallery item
     */
    public function update(Request $request, GalleryItem $galleryItem)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'images' => 'required|array|min:1|max:7',
            'images.*.media_id' => 'required|exists:media,id',
            'images.*.title' => 'nullable|string|max:255',
            'images.*.description' => 'nullable|string',
        ]);

        try {
            $galleryItem->update([
                'title' => $request->title,
                'description' => $request->description,
            ]);

            // Delete old images
            $galleryItem->images()->delete();

            // Add new images
            foreach ($request->images as $index => $imageData) {
                GalleryImage::create([
                    'gallery_item_id' => $galleryItem->id,
                    'media_id' => $imageData['media_id'],
                    'title' => $imageData['title'] ?? null,
                    'description' => $imageData['description'] ?? null,
                    'order' => $index,
                ]);
            }

            $galleryItem->load(['uploader:id,name', 'images.media']);

            return response()->json([
                'success' => true,
                'message' => 'Gallery berhasil diupdate',
                'data' => $galleryItem,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate gallery: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete gallery item
     */
    public function destroy(GalleryItem $galleryItem)
    {
        try {
            $galleryItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus gallery: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve gallery item
     */
    public function approve(GalleryItem $galleryItem)
    {
        try {
            $galleryItem->approve();

            return response()->json([
                'success' => true,
                'message' => 'Gallery berhasil disetujui',
                'data' => $galleryItem,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui gallery: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject gallery item
     */
    public function reject(Request $request, GalleryItem $galleryItem)
    {
        $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        try {
            $galleryItem->reject($request->rejection_reason);

            return response()->json([
                'success' => true,
                'message' => 'Gallery berhasil ditolak',
                'data' => $galleryItem,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak gallery: ' . $e->getMessage(),
            ], 500);
        }
    }
}
