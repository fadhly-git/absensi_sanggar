<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'siswas';

    protected $fillable = [
        'alamat',
        'status',
        'tanggal_terdaftar',
        'user_id',
        'qrcode_path',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $appends = [
        'status_text'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getNamaAttribute($value)
    {
        return $this->user ? $this->user->name : $value;
    }

    /**
     * Scope untuk siswa aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope untuk siswa tidak aktif
     */
    public function scopeTidakAktif($query)
    {
        return $query->where('status', false);
    }

    /**
     * Accessor untuk status text
     */
    public function getStatusTextAttribute()
    {
        return $this->status ? 'Aktif' : 'Tidak Aktif';
    }

    /**
     * Relationship dengan absensi
     */
    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'id_siswa');
    }

    /**
     * Get latest absensi
     */
    public function latestAbsensi()
    {
        return $this->hasOne(Absensi::class, 'id_siswa')->latest('tanggal');
    }

    /**
     * Count total absensi
     */
    public function getTotalAbsensiAttribute()
    {
        return $this->absensis()->count();
    }

    /**
     * Get absensi this month
     */
    public function getAbsensiBulanIniAttribute()
    {
        return $this->absensis()
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->count();
    }
}