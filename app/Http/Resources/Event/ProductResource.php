<?php

namespace App\Http\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            "name" => $this->name,
            "description" => $this->description,
            "image_url" => $this->image_url ? asset('storage/' . $this->image_url) : null,
            "is_active" => (bool) $this->is_active,
            "po_deadline" => $this->po_deadline,
            "po_deadline_formatted" => $this->po_deadline
                ? \Carbon\Carbon::parse($this->po_deadline)->format('d M Y H:i')
                : null,
            "is_po_open" => $this->is_active &&
                ($this->po_deadline === null || now()->lt($this->po_deadline)),
            "size_charts" => SizeChartsResource::collection($this->whenLoaded('sizeCharts')),
            "created_at" => $this->created_at?->toISOString(),
        ];
    }
}
