<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'event_type',
        'color',
        'is_cancelled',
        'cancel_reason',
        'recurrence_type',
        'recurrence_interval',
        'recurrence_days',
        'recurrence_until',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_cancelled' => 'boolean',
        'recurrence_days' => 'array',
        'recurrence_until' => 'datetime',
    ];

    /**
     * Get the creator
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for upcoming events
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', now())
            ->where('is_cancelled', false)
            ->orderBy('start_date');
    }

    /**
     * Scope for past events
     */
    public function scopePast($query)
    {
        return $query->where('start_date', '<', now())
            ->orderBy('start_date', 'desc');
    }

    /**
     * Scope for active (not cancelled) events
     */
    public function scopeActive($query)
    {
        return $query->where('is_cancelled', false);
    }

    /**
     * Scope for events by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('event_type', $type);
    }

    /**
     * Scope for events in date range
     */
    public function scopeInRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
                ->orWhereBetween('end_date', [$startDate, $endDate])
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                });
        });
    }

    /**
     * Check if event is ongoing
     */
    public function isOngoing(): bool
    {
        $now = now();
        return $this->start_date <= $now &&
            ($this->end_date === null || $this->end_date >= $now) &&
            !$this->is_cancelled;
    }

    /**
     * Check if event is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->start_date > now() && !$this->is_cancelled;
    }

    /**
     * Get event type label
     */
    public function getTypeLabel(): string
    {
        $labels = [
            'latihan' => 'Latihan',
            'ujian' => 'Ujian',
            'pentas' => 'Pentas',
            'libur' => 'Libur',
            'other' => 'Lainnya',
        ];

        return $labels[$this->event_type] ?? 'Lainnya';
    }

    /**
     * Expand recurring events into individual instances for a given range
     */
    public function expandInstances($startDate, $endDate)
    {
        if ($this->recurrence_type === 'none' || $this->recurrence_type === null) {
            return [$this];
        }

        $instances = [];
        $current = $this->start_date->copy();
        $until = $this->recurrence_until ? $this->recurrence_until->endOfDay() : $endDate->endOfDay();
        $limit = $until->min($endDate->endOfDay());

        // Safety limit to prevent infinite loops
        $maxInstances = 100;
        $count = 0;

        while ($current <= $limit && $count < $maxInstances) {
            if ($current->isSameDay($this->start_date) || $current > $this->start_date) {
                if ($current->endOfDay() >= $startDate->startOfDay()) {
                    // For weekly, check if the current day is in recurrence_days
                    if ($this->recurrence_type === 'weekly') {
                        $dayName = $current->format('D'); // Mon, Tue, etc.
                        if (empty($this->recurrence_days) || in_array($dayName, $this->recurrence_days)) {
                            $instances[] = $this->createInstanceAt($current);
                        }
                    } else {
                        $instances[] = $this->createInstanceAt($current);
                    }
                }
            }

            // Move to next interval
            switch ($this->recurrence_type) {
                case 'daily':
                    $current->addDays($this->recurrence_interval ?: 1);
                    break;
                case 'weekly':
                    $current->addWeeks($this->recurrence_interval ?: 1);
                    break;
                case 'monthly':
                    $current->addMonths($this->recurrence_interval ?: 1);
                    break;
                default:
                    break 2; // Break while if type is invalid
            }
            $count++;
        }

        return $instances;
    }

    /**
     * Create a virtual instance of this event at a specific date
     */
    protected function createInstanceAt($date)
    {
        // If it's the original start date, return this actual model instead of a clone
        // so that ID based relationships and metadata are preserved exactly.
        if ($date->isSameDay($this->start_date)) {
            return $this;
        }

        $instance = $this->replicate();

        $instance->start_date = $date->copy()->setTimeFrom($this->start_date);
        if ($this->end_date) {
            $instance->end_date = $date->copy()->setTimeFrom($this->end_date);
            // If end_date was on a different day, maintain that difference
            $dayDiff = $this->start_date->diffInDays($this->end_date, false);
            if ($dayDiff > 0) {
                $instance->end_date->addDays($dayDiff);
            }
        }

        // Mark as virtual instance (not in DB)
        $instance->is_virtual = true;
        $instance->id = $this->id . '_' . $date->format('Ymd');

        return $instance;
    }
}
