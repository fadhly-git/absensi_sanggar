<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsensiReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this adalah satu siswa + absensi mingguan
        return [
            'siswa_id' => $this->siswa_id,
            'siswa_nama' => $this->user_name ?? $this->siswa_nama,
            'siswa_alamat' => $this->siswa_alamat,
            'siswa_status' => $this->siswa_status,
            // Merge absensi array (tanggal => status) as top-level keys
            ...($this->absensi ?? []),
        ];
    }
}
