<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'page_key',
        'title',
        'sections',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'updated_by',
    ];

    protected $casts = [
        'sections' => 'array',
    ];

    /**
     * Get the updater
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get page by key
     */
    public static function getByKey(string $key)
    {
        return static::where('page_key', $key)->first();
    }

    /**
     * Get section data
     */
    public function getSection(string $sectionKey, $default = null)
    {
        return $this->sections[$sectionKey] ?? $default;
    }

    /**
     * Update section data
     */
    public function updateSection(string $sectionKey, array $data): void
    {
        $sections = $this->sections;
        $sections[$sectionKey] = array_merge($sections[$sectionKey] ?? [], $data);

        $this->update([
            'sections' => $sections,
            'updated_by' => auth()->id(),
        ]);
    }

    /**
     * Get meta title or use page title
     */
    public function getMetaTitleAttribute($value): string
    {
        return $value ?: $this->title;
    }
}
