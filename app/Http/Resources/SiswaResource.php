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
        return [
            'id' => $this->id,
            'nama' => $this->user ? $this->user->name : $this->nama,
            'alamat' => $this->alamat,
            'status' => $this->status,
            'tanggal_terdaftar' => $this->tanggal_terdaftar,
            'status_text' => $this->status_text,
            'total_absensi' => $this->whenLoaded('absensis', fn() => $this->absensis->count()),
            'absensi_bulan_ini' => $this->whenLoaded('absensis', function () {
                return $this->absensis
                    ->whereBetween('tanggal', [
                        now()->startOfMonth()->toDateString(),
                        now()->endOfMonth()->toDateString()
                    ])->count();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
