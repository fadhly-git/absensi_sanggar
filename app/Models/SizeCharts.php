<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SizeCharts extends Model
{
    protected $table = 'size_charts';

    protected $fillable = [
        'product_id',
        'category',
        'size_label',
        'width_cm',
        'length_cm',
        'price_short_sleeve',
        'price_long_sleeve',
    ];
}
