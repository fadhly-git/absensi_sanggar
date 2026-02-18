<?php

namespace App\Http\Resources\Event;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiswaSimpleResource extends JsonResource
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
            'name' => $this->user?->name ?? 'Unknown',
            'display_name' => $this->getDisplayName(),
        ];
    }

    protected function getDisplayName(): string
    {
        $name = $this->user?->name ?? 'Unknown';
        return $name . ' (Siswa)';
    }
}
