<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['nullable', 'exists:siswas,id'],
            'guest_name' => ['required_without:student_id', 'nullable', 'string', 'max:255'],
            'guest_phone' => ['required_without:student_id', 'nullable', 'string', 'max:20'],
            'status' => ['sometimes', Rule::in(['pending', 'paid', 'processing', 'completed', 'cancelled'])],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.size_chart_id' => ['nullable', 'exists:size_charts,id'],
            'items.*.sleeve_type' => ['required_with:items', Rule::in(['short', 'long'])],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.exists' => 'Siswa tidak ditemukan',
            'guest_name.required_without' => 'Nama tamu wajib diisi jika bukan siswa',
            'guest_phone.required_without' => 'Nomor HP tamu wajib diisi jika bukan siswa',
            'status.in' => 'Status tidak valid',
            'items.min' => 'Minimal harus ada 1 item pesanan',
            'items.*.product_id.required_with' => 'Produk wajib dipilih',
            'items.*.product_id.exists' => 'Produk tidak ditemukan',
            'items.*.size_chart_id.exists' => 'Ukuran tidak ditemukan',
            'items.*.sleeve_type.required_with' => 'Tipe lengan wajib dipilih',
            'items.*.sleeve_type.in' => 'Tipe lengan tidak valid',
            'items.*.quantity.required_with' => 'Jumlah wajib diisi',
            'items.*.quantity.min' => 'Jumlah minimal 1',
        ];
    }
}
