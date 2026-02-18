<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'po_deadline' => ['required', 'date'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // validasi array size chart
            'size_charts' => ['required', 'array', 'min:1'],
            'size_charts.*.category' => ['required', 'in:kids, adults'],
            'size_charts.*.size_label' => ['required', 'string'],
            'size_charts.*.width_cm' => ['required', 'numeric'],
            'size_charts.*.length_cm' => ['required', 'numeric'],
            'size_charts.*.price_short_sleeve' => ['required', 'numeric'],
            'size_charts.*.price_long_sleeve' => ['required', 'numeric'],
        ];
    }

    protected function prepareForValidation()
    {
        // Convert JSON string to array if needed
        if ($this->has('size_charts') && is_string($this->size_charts)) {
            $this->merge([
                'size_charts' => json_decode($this->size_charts, true)
            ]);
        }
    }
}
