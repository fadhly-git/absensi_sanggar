<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\GalleryItem;
use App\Models\Event;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;

class CMSController extends Controller
{
    /**
     * Get CMS statistics
     */
    public function getStats(): JsonResponse
    {
        $stats = [
            'posts' => [
                'total' => Post::count(),
                'published' => Post::where('status', 'published')->count(),
                'draft' => Post::where('status', 'draft')->count(),
            ],
            'galleries' => [
                'total' => GalleryItem::count(),
                'approved' => GalleryItem::where('status', 'approved')->count(),
                'pending' => GalleryItem::where('status', 'pending')->count(),
            ],
            'events' => [
                'total' => Event::count(),
                'upcoming' => Event::where('start_date', '>=', now())
                    ->where('is_cancelled', false)
                    ->count(),
            ],
            'messages' => [
                'total' => ContactMessage::count(),
                'unread' => ContactMessage::where('is_read', false)->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
