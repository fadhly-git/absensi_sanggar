<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiswaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
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
        $rules = [
            'nama' => 'required|string|min:2|max:255',
            'alamat' => 'required|string|min:5|max:1000',
            'status' => 'required|boolean'
        ];

        if ($this->isMethod('patch') || $this->isMethod('put')) {
            // Untuk update, field boleh kadang-kadang
            $rules = [
                'nama' => 'sometimes|required|string|min:2|max:255',
                'alamat' => 'sometimes|required|string|min:5|max:1000',
                'status' => 'sometimes|required|boolean'
            ];
        }

        return $rules;
    }
}
