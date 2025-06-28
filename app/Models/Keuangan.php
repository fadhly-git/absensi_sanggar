<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // 1. Tambahkan use statement
use Illuminate\Support\Facades\DB;

class Keuangan extends Model
{
    use SoftDeletes; // 2. Gunakan trait SoftDeletes

    protected $table = 'keuangans';

    /**
     * Atribut yang dapat diisi. 'saldo_terakhir' telah dihapus.
     */
    protected $fillable = [
        'uang_masuk',
        'keterangan_masuk',
        'uang_keluar',
        'keterangan_keluar',
        'tanggal',
    ];

    // Method-method query scope Anda sudah baik, bisa kita sederhanakan sedikit
    // dengan menggunakan query builder dari Eloquent langsung.

    public static function getUangMasukByDateQuery($date, $params)
    {
        $query = self::select('id', 'tanggal', 'keterangan_masuk AS keterangan', 'uang_masuk AS jumlah')
            ->where('uang_masuk', '!=', 0); // Soft delete akan otomatis ditangani oleh Eloquent

        if ($params === 'year') {
            $query->whereYear('tanggal', '=', (int) $date);
        } elseif ($params === 'month') {
            $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date]);
        }

        return $query->orderBy('tanggal', 'ASC');
    }

    public static function getUangKeluarByDateQuery($date, $params)
    {
        $query = self::select('id', 'tanggal', 'keterangan_keluar AS keterangan', 'uang_keluar AS jumlah')
            ->where('uang_keluar', '!=', 0);

        if ($params === 'year') {
            $query->whereYear('tanggal', '=', (int) $date);
        } elseif ($params === 'month') {
            $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date]);
        }

        return $query->orderBy('tanggal', 'ASC');
    }

    public static function getTotalByType($type, $date, $params)
    {
        $column = ($type === 'masuk') ? 'uang_masuk' : 'uang_keluar';

        $query = self::where($column, '!=', 0);

        if ($params === 'year') {
            $query->whereYear('tanggal', '=', (int) $date);
        } elseif ($params === 'month') {
            $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date]);
        }

        return $query->sum($column);
    }
}