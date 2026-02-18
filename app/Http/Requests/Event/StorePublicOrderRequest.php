<?php

namespace App\Http\Requests\Event;

use App\Models\Products;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePublicOrderRequest extends FormRequest
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
            // Buyer info - either student_id OR guest info
            'student_id' => ['nullable', 'exists:siswas,id'],
            'guest_name' => ['required_without:student_id', 'nullable', 'string', 'max:255'],
            'guest_phone' => ['required_without:student_id', 'nullable', 'string', 'max:20'],

            // Items
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.size_chart_id' => ['required', 'exists:size_charts,id'],
            'items.*.sleeve_type' => ['required', Rule::in(['short', 'long'])],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.exists' => 'Siswa tidak ditemukan.',
            'guest_name.required_without' => 'Nama wajib diisi untuk pembelian umum.',
            'guest_phone.required_without' => 'Nomor HP wajib diisi untuk pembelian umum.',
            'items.required' => 'Minimal harus ada 1 item pesanan.',
            'items.min' => 'Minimal harus ada 1 item pesanan.',
            'items.*.product_id.required' => 'Produk harus dipilih.',
            'items.*.product_id.exists' => 'Produk tidak valid.',
            'items.*.size_chart_id.required' => 'Ukuran harus dipilih.',
            'items.*.size_chart_id.exists' => 'Ukuran tidak valid.',
            'items.*.sleeve_type.required' => 'Tipe lengan harus dipilih.',
            'items.*.sleeve_type.in' => 'Tipe lengan tidak valid.',
            'items.*.quantity.required' => 'Jumlah harus diisi.',
            'items.*.quantity.min' => 'Jumlah minimal 1.',
            'items.*.quantity.max' => 'Jumlah maksimal 100 per item.',
        ];
    }

    /**
     * Custom validation
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Fix: Gunakan Product model benar
            if (!$this->student_id && (!$this->guest_name || !$this->guest_phone)) {
                $validator->errors()->add('buyer', 'Pilih siswa atau isi data pembeli umum.');
            }

            if ($this->items) {
                foreach ($this->items as $index => $item) {
                    $product = Products::find($item['product_id'] ?? null);
                    if (!$product) {
                        $validator->errors()->add("items.{$index}.product_id", 'Produk tidak ditemukan.');
                        continue;
                    }
                    if (!$product->is_active) {
                        $validator->errors()->add(
                            "items.{$index}.product_id",
                            "Produk '{$product->name}' sudah tidak tersedia."
                        );
                    }
                    if ($product->po_deadline && now()->gt($product->po_deadline)) {
                        $validator->errors()->add(
                            "items.{$index}.product_id",
                            "Pre-order '{$product->name}' sudah ditutup."
                        );
                    }
                }
            }
        });
    }

    // 🔥 CRUCIAL: JSON 422, NO REDIRECT!
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first() ?? 'Validasi gagal',
            'errors' => $validator->errors(),
        ], 422));
    }
}
