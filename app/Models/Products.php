<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name',
        'description',
        'image_url',
        'is_active',
        'po_deadline',
    ];

    public function sizeCharts()
    {
        return $this->hasMany(SizeCharts::class, 'product_id');
    }

    public function getPrice(string $sleeveType)
    {
        return $sleeveType === 'long' ? $this->price_long_sleeve : $this->price_short_sleeve;
    }
}
