<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $table = 'absensis';
    protected $fillable = [
        'id_siswa',
        'tanggal',
        'notes',
        'bonus'
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
}
