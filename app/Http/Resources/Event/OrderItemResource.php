<?php

namespace App\Http\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product?->name,
            'size_label' => $this->size_label,
            'category' => $this->category,
            'category_label' => $this->category === 'kids' ? 'Anak' : 'Dewasa',
            'sleeve_type' => $this->sleeve_type,
            'sleeve_type_label' => $this->sleeve_type === 'long' ? 'Lengan Panjang' : 'Lengan Pendek',
            'width_cm' => $this->width_cm,
            'length_cm' => $this->length_cm,
            'price_at_moment' => $this->price_at_moment,
            'price_formatted' => 'Rp ' . number_format($this->price_at_moment, 0, ',', '.'),
            'quantity' => $this->quantity,
            'subtotal' => $this->subtotal,
            'subtotal_formatted' => 'Rp ' . number_format($this->subtotal, 0, ',', '.'),
        ];
    }
}
