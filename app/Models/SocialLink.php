<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialLink extends Model
{
    protected $fillable = [
        'platform',
        'url',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active links only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered links
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * Get icon name based on platform
     */
    public function getIconAttribute(): string
    {
        $icons = [
            'instagram' => 'Instagram',
            'facebook' => 'Facebook',
            'youtube' => 'Youtube',
            'tiktok' => 'Music',
            'twitter' => 'Twitter',
            'linkedin' => 'Linkedin',
            'whatsapp' => 'MessageCircle',
        ];

        return $icons[strtolower($this->platform)] ?? 'Link';
    }

    /**
     * Get platform color
     */
    public function getColorAttribute(): string
    {
        $colors = [
            'instagram' => '#E4405F',
            'facebook' => '#1877F2',
            'youtube' => '#FF0000',
            'tiktok' => '#000000',
            'twitter' => '#1DA1F2',
            'linkedin' => '#0A66C2',
            'whatsapp' => '#25D366',
        ];

        return $colors[strtolower($this->platform)] ?? '#3b82f6';
    }
}
