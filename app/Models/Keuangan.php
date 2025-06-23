<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Keuangan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'keuangans';
    protected $fillable = ['tanggal', 'keterangan', 'jumlah', 'tipe'];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'decimal:2',
    ];
}