<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Keuangan extends Model
{
    //
    protected $table = 'keuangans';
    protected $fillable = [
        'saldo_terakhir',
        'uang_masuk',
        'keterangan_masuk',
        'uang_keluar',
        'keterangan_keluar',
        'tanggal',
    ];
}
