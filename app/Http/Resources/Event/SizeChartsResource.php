<?php

namespace App\Http\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SizeChartsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "category" => $this->category,
            "size_label" => $this->size_label,
            "width_cm" => $this->width_cm,
            "length_cm" => $this->length_cm,
            "price_short_sleeve" => $this->price_short_sleeve,
            "price_long_sleeve" => $this->price_long_sleeve,
        ];
    }
}
