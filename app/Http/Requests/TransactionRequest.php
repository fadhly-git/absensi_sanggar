<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:masuk,keluar',
            'tanggal' => 'required|date',
            'data' => 'required|array',
            'data.*.amount' => 'required|numeric|min:0',
            'data.*.keterangan' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Tipe transaksi harus diisi',
            'type.in' => 'Tipe transaksi tidak valid',
            'tanggal.required' => 'Tanggal harus diisi',
            'tanggal.date' => 'Format tanggal tidak valid',
            'data.required' => 'Data transaksi harus diisi',
            'data.*.amount.required' => 'Jumlah harus diisi',
            'data.*.amount.numeric' => 'Jumlah harus berupa angka',
            'data.*.amount.min' => 'Jumlah minimal 0',
            'data.*.keterangan.required' => 'Keterangan harus diisi',
            'data.*.keterangan.max' => 'Keterangan maksimal 255 karakter',
        ];
    }
}