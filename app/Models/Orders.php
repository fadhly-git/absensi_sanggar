<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    protected $table = 'orders';

    protected $with = ['items'];
    protected $guarded = ['id'];

    public function getStatusColorAttribute()
    {
        return match ($this->status) {
            'pending' => 'warning',
            'paid' => 'info',
            'shipped' => 'primary',
            'completed' => 'success',
            'canceled' => 'danger',
            default => 'secondary',
        };
    }

    // Relasi
    public function items()
    {
        return $this->hasMany(OrderItems::class, 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id');
    }

    public function sizeChart()
    {
        return $this->belongsTo(SizeCharts::class, 'size_chart_id');
    }

    // logic
    public function getBuyerNameAttribute()
    {
        if ($this->student_id && $this->student) {
            return $this->student->nama . ' (' . $this->student->kelas . ')';
        }
        return $this->guest_name . ' (Umum)';
    }

    public function siswas()
    {
        return $this->belongsTo(Siswa::class, 'student_id');
    }
}
