<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportOrderRequest extends FormRequest
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
            'type' => ['sometimes', Rule::in(['full', 'summary', 'detail'])],
            'status' => ['sometimes', 'nullable', Rule::in(['pending', 'paid', 'processing', 'completed', 'cancelled'])],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:date_from'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Tipe ekspor tidak valid',
            'status.in' => 'Status tidak valid',
            'date_from.date' => 'Tanggal awal tidak valid',
            'date_to.date' => 'Tanggal akhir tidak valid',
            'date_to.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal awal',
        ];
    }
}
