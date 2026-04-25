<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    protected $fillable = [
        'gallery_item_id',
        'media_id',
        'title',
        'description',
        'order',
    ];

    /**
     * Get the gallery item
     */
    public function galleryItem()
    {
        return $this->belongsTo(GalleryItem::class);
    }

    /**
     * Get the media
     */
    public function media()
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * Scope for ordered images
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
