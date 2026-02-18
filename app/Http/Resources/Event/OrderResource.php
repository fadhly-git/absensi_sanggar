<?php

namespace App\Http\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'invoice_code' => $this->invoice_code,
            'student_id' => $this->student_id,
            'student_name' => $this->siswas?->user?->name,
            'guest_name' => $this->guest_name,
            'guest_phone' => $this->guest_phone,
            'buyer_name' => $this->student_id
                ? ($this->siswas?->user?->name ?? 'Siswa')
                : ($this->guest_name ?? 'Tamu'),
            'buyer_detail' => $this->student_id ? ($this->siswas?->alamat ?? '') : ($this->guest_phone ?? ''),
            'buyer_type' => $this->student_id ? 'student' : 'guest',
            'buyer_type_label' => $this->student_id ? 'Siswa' : 'Umum',
            'total_amount' => $this->total_amount,
            'total_amount_formatted' => 'Rp ' . number_format($this->total_amount, 0, ',', '.'),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'status_color' => $this->getStatusColor(),
            'payment_proof' => $this->payment_proof ? url('storage/' . $this->payment_proof) : null,
            'is_first_view' => $this->is_first_view ?? true, // Default true for backward compatibility
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->items->count(),
            'total_quantity' => $this->items->sum('quantity'),
            'created_at' => $this->created_at,
            'created_at_formatted' => $this->created_at->format('d M Y H:i'),
            'updated_at' => $this->updated_at,
        ];
    }

    protected function getBuyerDisplayName(): string
    {
        if ($this->student_id && $this->siswas) {
            $name = $this->siswas->user->name ?? 'Siswa';
            return $name . ' (Siswa)';
        }
        return $this->guest_name . ' (Umum)';
    }

    protected function getStatusLabel(): string
    {
        if ($this->payment_proof && $this->status === 'pending') {
            return 'Menunggu Verifikasi';
        }
        return match ($this->status) {
            'pending' => 'Menunggu Pembayaran',
            'paid' => 'Lunas',
            'processing' => 'Diproses',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => 'Tidak Diketahui',
        };
    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'pending' => 'warning',
            'paid' => 'info',
            'processing' => 'primary',
            'completed' => 'success',
            'cancelled' => 'destructive',
            default => 'secondary',
        };
    }
}
