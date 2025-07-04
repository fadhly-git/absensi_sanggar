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
            'nama' => $this->nama,
            'alamat' => $this->alamat,
            'status' => $this->status,
            'tanggal_terdaftar' => $this->tanggal_terdaftar,
            'status_text' => $this->status_text,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
