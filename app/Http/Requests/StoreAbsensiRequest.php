<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class StoreAbsensiRequest extends FormRequest
{
    /**
     * Tentukan apakah user diizinkan untuk membuat request ini.
     */
    public function authorize(): bool
    {
        // Set ke true jika semua user yang terotentikasi boleh melakukan ini
        return true;
    }

    /**
     * Siapkan data untuk validasi.
     * Kita akan mapping data di sini sebelum divalidasi.
     */
    protected function prepareForValidation(): void
    {
        $mappedData = collect($this->input('data'))->map(function ($item) {
            return [
                'id_siswa' => $item['id'] ?? null,
                'tanggal' => $item['formattedDate'] ?? null,
                'notes' => $item['keterangan'] ?? null,
                'bonus' => isset($item['bonus']) ? ($item['bonus'] ? 1 : 0) : 0,
            ];
        })->toArray();

        $this->merge([
            'data' => $mappedData,
        ]);
    }

    /**
     * Dapatkan aturan validasi yang berlaku untuk request ini.
     */
    public function rules(): array
    {
        return [
            'data' => 'required|array',
            'data.*.id_siswa' => 'required|integer|exists:siswas,id',
            'data.*.tanggal' => 'required|date_format:Y-m-d', // Validasi format tanggal lebih ketat
            'data.*.bonus' => 'required|boolean', // Gunakan boolean untuk 0/1
            'data.*.notes' => 'nullable|string|max:65535', // Batasi panjang notes
        ];
    }

    /**
     * Dapatkan pesan error kustom.
     */
    public function messages(): array
    {
        return [
            'data.*.id_siswa.required' => 'ID Siswa wajib diisi.',
            'data.*.id_siswa.exists' => 'Siswa tidak ditemukan di database.',
            'data.*.tanggal.required' => 'Tanggal wajib diisi.',
            'data.*.tanggal.date_format' => 'Format tanggal harus YYYY-MM-DD.',
        ];
    }

    /**
     * Method kustom untuk mendapatkan data yang siap di-insert ke database.
     */
    public function getAbsensiDataForInsert(): array
    {
        $now = Carbon::now();
        // Ambil data yang sudah divalidasi dan di-mapping
        return collect($this->validated()['data'])->map(function ($item) use ($now) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
            return $item;
        })->toArray();
    }
}