<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Get all posts
     */
    public function index(Request $request)
    {
        $query = Post::with(['category', 'author:id,name'])
            ->latest();

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'published') {
                $query->published();
            } elseif ($request->status === 'draft') {
                $query->draft();
            }
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate($request->get('per_page', 15));

        return response()->json($posts);
    }

    /**
     * Get single post
     */
    public function show(Post $post)
    {
        $post->load(['category', 'author:id,name']);

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }

    /**
     * Create new post
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'required|string',
            'category_id' => 'required|exists:post_categories,id',
            'status' => 'required|in:draft,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'video_url' => 'nullable|url',
        ]);

        try {
            $data = $request->all();

            // Set published_at if status is published
            if ($request->status === 'published') {
                $data['published_at'] = now();
            }

            $post = Post::create($data);
            $post->load(['category', 'author:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil ditambahkan',
                'data' => $post,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update post
     */
    public function update(Request $request, Post $post)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'required|string',
            'category_id' => 'required|exists:post_categories,id',
            'status' => 'required|in:draft,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'video_url' => 'nullable|url',
        ]);

        try {
            $data = $request->all();

            // Set published_at if changing from draft to published
            if ($request->status === 'published' && $post->status === 'draft') {
                $data['published_at'] = $post->published_at ?? now();
            }

            $post->update($data);
            $post->load(['category', 'author:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil diupdate',
                'data' => $post,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete post
     */
    public function destroy(Post $post)
    {
        try {
            $post->delete();

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish post
     */
    public function publish(Post $post)
    {
        try {
            $post->update([
                'status' => 'published',
                'published_at' => $post->published_at ?? now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dipublish',
                'data' => $post,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal publish artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change post to draft
     */
    public function draft(Post $post)
    {
        try {
            $post->update([
                'status' => 'draft',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dijadikan draft',
                'data' => $post,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah artikel: ' . $e->getMessage(),
            ], 500);
        }
    }
}
