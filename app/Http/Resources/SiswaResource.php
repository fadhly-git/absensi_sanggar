<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiswaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $absensisLoaded = $this->relationLoaded('absensis');
        return [
            'id' => $this->id,
            'nama' => $this->user ? $this->user->name : $this->nama,
            'alamat' => $this->alamat,
            'status' => $this->status,
            'tanggal_terdaftar' => $this->tanggal_terdaftar,
            'status_text' => $this->status_text,
            'total_absensi' => $absensisLoaded ? $this->absensis->count() : 0,
            'absensi_bulan_ini' => $absensisLoaded ? $this->absensis->where('tanggal', '>=', now()->startOfMonth())->count() : 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
