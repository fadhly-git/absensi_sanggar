<?php

namespace App\Models;

use App\Services\SlugService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Post extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'category_id',
        'author_id',
        'status',
        'published_at',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'video_url',
        'views',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            // Generate SEO-optimized slug
            if (!$post->slug) {
                $year = $post->published_at ? $post->published_at->year : now()->year;
                $post->slug = SlugService::generateSEOSlug($post->title, 60, true, true, $year);
            }

            // Auto-generate meta fields if not provided
            if (!$post->meta_title) {
                $post->meta_title = $post->title . ' - Ngesti Laras Budaya Kendal';
            }

            if (!$post->meta_description) {
                $post->meta_description = SlugService::generateMetaDescription(
                    $post->content ?? $post->excerpt ?? $post->title,
                    160
                );
            }

            if (!$post->meta_keywords) {
                $category = PostCategory::find($post->category_id);
                $post->meta_keywords = SlugService::generateKeywords(
                    $post->title,
                    $post->content,
                    $category?->name
                );
            }

            if (!$post->author_id) {
                $post->author_id = auth()->id();
            }
        });

        static::updating(function ($post) {
            // Regenerate slug if title changed
            if ($post->isDirty('title')) {
                $year = $post->published_at ? $post->published_at->year : now()->year;
                $post->slug = SlugService::generateSEOSlug($post->title, 60, true, true, $year);
            }

            // Update meta title if title changed and meta_title is auto-generated
            if ($post->isDirty('title') && str_contains($post->meta_title ?? '', '- Ngesti Laras Budaya Kendal')) {
                $post->meta_title = $post->title . ' - Ngesti Laras Budaya Kendal';
            }

            // Update meta description if content changed and not manually set
            if ($post->isDirty('content') && empty($post->meta_description)) {
                $post->meta_description = SlugService::generateMetaDescription(
                    $post->content ?? $post->excerpt ?? $post->title,
                    160
                );
            }
        });
    }

    /**
     * Get the category
     */
    public function category()
    {
        return $this->belongsTo(PostCategory::class);
    }

    /**
     * Get the author
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope for published posts
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope for draft posts
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope for latest posts
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    /**
     * Scope for popular posts
     */
    public function scopePopular($query)
    {
        return $query->orderBy('views', 'desc');
    }

    /**
     * Increment views
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Get excerpt or auto-generate from content
     */
    public function getExcerptAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        return Str::limit(strip_tags($this->content), 160);
    }

    /**
     * Get meta title or use post title
     */
    public function getMetaTitleAttribute($value): string
    {
        return $value ?: $this->title;
    }

    /**
     * Check if post has video
     */
    public function hasVideo(): bool
    {
        return !empty($this->video_url);
    }

    /**
     * Get YouTube video ID from URL
     */
    public function getYoutubeIdAttribute(): ?string
    {
        if (!$this->video_url) {
            return null;
        }

        $pattern = '/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/';

        if (preg_match($pattern, $this->video_url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
