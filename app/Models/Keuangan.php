<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    public static function getUangMasukByDateQuery($date, $params)
    {
        $query = self::select('id', 'tanggal', 'keterangan_masuk AS keterangan', 'uang_masuk AS jumlah')
            ->where('uang_masuk', '!=', 0)
            ->where('deleted', '!=', 1);

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
            ->where('uang_keluar', '!=', 0)
            ->where('deleted', '!=', 1);

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

        $query = self::where($column, '!=', 0)
            ->where('deleted', '!=', 1);

        if ($params === 'year') {
            $query->whereYear('tanggal', '=', (int) $date);
        } elseif ($params === 'month') {
            $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date]);
        }

        return $query->sum($column);
    }

    // Metode untuk mendapatkan uang masuk berdasarkan tanggal dan parameter
    public static function getUangMasukByDate($date, $params)
    {
        if ($params === 'year') {
            return DB::table('keuangans')
                ->select('id', 'tanggal', 'keterangan_masuk AS keterangan', 'uang_masuk AS jumlah')
                ->whereYear('tanggal', '=', (int) $date)
                ->where('uang_masuk', '!=', 0)
                ->where('deleted', '!=', 1)
                ->orderBy('tanggal', 'ASC')
                ->get();
        } elseif ($params === 'month') {
            return DB::table('keuangans')
                ->select('id', 'tanggal', 'keterangan_masuk AS keterangan', 'uang_masuk AS jumlah')
                ->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date])
                ->where('uang_masuk', '!=', 0)
                ->where('deleted', '!=', 1)
                ->orderBy('tanggal', 'ASC')
                ->get();
        }
        return collect(); // Jika parameter tidak valid, kembalikan collection kosong
    }

    // Metode untuk mendapatkan uang keluar berdasarkan tanggal dan parameter
    public static function getUangKeluarByDate($date, $params)
    {
        if ($params === 'year') {
            return DB::table('keuangans')
                ->select('id', 'tanggal', 'keterangan_keluar AS keterangan', 'uang_keluar AS jumlah')
                ->whereYear('tanggal', '=', (int) $date)
                ->where('uang_keluar', '!=', 0)
                ->where('deleted', '!=', 1)
                ->orderBy('tanggal', 'ASC')
                ->get();
        } elseif ($params === 'month') {
            return DB::table('keuangans')
                ->select('id', 'tanggal', 'keterangan_keluar AS keterangan', 'uang_keluar AS jumlah')
                ->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$date])
                ->where('uang_keluar', '!=', 0)
                ->where('deleted', '!=', 1)
                ->orderBy('tanggal', 'ASC')
                ->get();
        }
        return collect(); // Jika parameter tidak valid, kembalikan collection kosong
    }
}
