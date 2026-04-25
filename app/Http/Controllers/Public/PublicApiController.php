<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\GalleryItem;
use App\Models\Page;
use App\Models\Event;
use App\Models\SiteSetting;
use App\Models\SocialLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicApiController extends Controller
{
    /**
     * Get published posts
     */
    public function getPosts(Request $request)
    {
        $query = Post::with(['category', 'author'])
            ->published()
            ->orderBy('published_at', 'desc');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Exclude specific post
        if ($request->filled('exclude')) {
            $query->where('id', '!=', $request->exclude);
        }

        // Limit
        if ($request->filled('limit')) {
            $posts = $query->limit($request->limit)->get();
            return response()->json(['data' => $posts]);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $posts = $query->paginate($perPage);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Get single post by slug
     */
    public function getPost($slug)
    {
        $post = Post::with(['category', 'author'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => $post]);
    }

    /**
     * Increment post views
     */
    public function incrementPostViews($id)
    {
        $post = Post::findOrFail($id);
        $post->incrementViews();

        return response()->json(['success' => true]);
    }

    /**
     * Get categories
     */
    public function getCategories()
    {
        $categories = PostCategory::orderBy('name')->get();
        return response()->json(['data' => $categories]);
    }

    /**
     * Get approved gallery items
     */
    public function getGallery(Request $request)
    {
        $query = GalleryItem::with('images')
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc');

        $items = $query->get();
        return response()->json(['data' => $items]);
    }

    /**
     * Get page by key
     */
    public function getPage($slug)
    {
        $page = Page::where('page_key', $slug)->firstOrFail();
        return response()->json(['data' => $page]);
    }

    /**
     * Get site settings
     */
    public function getSettings()
    {
        $settings = SiteSetting::all();
        return response()->json(['data' => $settings]);
    }

    /**
     * Get social links
     */
    public function getSocialLinks()
    {
        $links = SocialLink::orderBy('order')->get();
        return response()->json(['data' => $links]);
    }

    /**
     * Get statistics
     */
    public function getStats()
    {
        // Get active students count (all students with role siswa)
        $activeStudents = DB::table('users')
            ->where('role', 'siswa')
            ->count();

        // Get total events count
        $totalEvents = Event::count();

        // Get year founded from settings
        $yearFounded = SiteSetting::where('key', 'year_founded')->value('value') ?? 2010;

        return response()->json([
            'data' => [
                'active_students' => $activeStudents,
                'total_events' => $totalEvents,
                'year_founded' => (int) $yearFounded,
            ],
        ]);
    }

    /**
     * Get upcoming events
     */
    public function getUpcomingEvents(Request $request)
    {
        $limit = $request->get('limit', 5);

        $events = Event::upcoming()
            ->active()
            ->orderBy('start_date')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $events]);
    }
}
