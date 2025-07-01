<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Keuangan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'keuangans';

    protected $fillable = [
        'tanggal',
        'uang_masuk',
        'uang_keluar',
        'keterangan_masuk',
        'keterangan_keluar',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'uang_masuk' => 'decimal:2',
        'uang_keluar' => 'decimal:2',
    ];

    // Accessor untuk mendapatkan jumlah berdasarkan tipe
    public function getJumlahAttribute()
    {
        return $this->uang_masuk > 0 ? $this->uang_masuk : $this->uang_keluar;
    }

    // Accessor untuk mendapatkan keterangan berdasarkan tipe
    public function getKeteranganAttribute()
    {
        return $this->uang_masuk > 0 ? $this->keterangan_masuk : $this->keterangan_keluar;
    }

    // Scope untuk filter berdasarkan tipe
    public function scopeType($query, $type)
    {
        if ($type === 'masuk') {
            return $query->where('uang_masuk', '>', 0);
        } else {
            return $query->where('uang_keluar', '>', 0);
        }
    }

    // Scope untuk filter berdasarkan periode
    public function scopePeriod($query, $date, $params)
    {
        if ($params === 'year') {
            return $query->whereYear('tanggal', $date);
        } else {
            return $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date]);
        }
    }
}