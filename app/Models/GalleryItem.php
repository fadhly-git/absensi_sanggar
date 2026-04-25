<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GalleryItem extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'uploaded_by',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'order',
        'is_featured',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'is_featured' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (!$item->slug) {
                $item->slug = Str::slug($item->title);
            }
            if (!$item->uploaded_by) {
                $item->uploaded_by = auth()->id();
            }
        });

        static::updating(function ($item) {
            if ($item->isDirty('title')) {
                $item->slug = Str::slug($item->title);
            }
        });
    }

    /**
     * Get the uploader
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the reviewer
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get gallery images
     */
    public function images()
    {
        return $this->hasMany(GalleryImage::class)->orderBy('order');
    }

    /**
     * Scope for approved items
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for pending items
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for rejected items
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for featured items
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for ordered items
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * Approve gallery item
     */
    public function approve(?int $reviewerId = null): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewerId ?? auth()->id(),
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject gallery item
     */
    public function reject(string $reason, ?int $reviewerId = null): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewerId ?? auth()->id(),
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Get first image as cover
     */
    public function getCoverImageAttribute()
    {
        return $this->images()->first();
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'approved' => 'green',
            'pending' => 'yellow',
            'rejected' => 'red',
            default => 'gray',
        };
    }
}
