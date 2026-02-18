<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class AbsensiQrRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Bisa ditambahkan logic authorization jika diperlukan
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            '*.rawValue' => 'required|string',
            '*.tanggal' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    // Parse tanggal dengan format yang fleksibel
                    try {
                        $date = Carbon::parse($value);

                        // Validasi format Y-m-d
                        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                            $fail('Format tanggal harus YYYY-MM-DD');
                            return;
                        }

                        // Validasi hari Minggu
                        if ($date->dayOfWeek !== Carbon::SUNDAY) {
                            $fail('Absensi hanya dapat dilakukan pada hari Minggu.');
                        }
                    } catch (\Exception $e) {
                        $fail('Format tanggal tidak valid');
                    }
                },
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            '*.rawValue.required' => 'Data QR code wajib diisi',
            '*.rawValue.string' => 'Format data QR code tidak valid',
            '*.tanggal.required' => 'Tanggal wajib diisi',
            '*.tanggal.string' => 'Format tanggal tidak valid',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            '*.rawValue' => 'data QR',
            '*.tanggal' => 'tanggal absensi',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Validation\ValidationException($validator, response()->json([
            'success' => false,
            'message' => 'Data validasi gagal',
            'errors' => $validator->errors()
        ], 422));
    }
}
