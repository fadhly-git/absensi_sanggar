<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Get all events
     */
    public function index(Request $request)
    {
        $query = Event::with('creator:id,name');

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'upcoming') {
                $query->upcoming();
            } elseif ($request->status === 'past') {
                $query->past();
            } elseif ($request->status === 'cancelled') {
                $query->where('is_cancelled', true);
            }
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->inRange($request->start_date, $request->end_date);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // For calendar view, return all events in range
        if ($request->boolean('calendar')) {
            $rawEvents = $query->get();
            $expandedEvents = collect();

            $searchStart = \Carbon\Carbon::parse($request->start_date ?? now()->startOfMonth());
            $searchEnd = \Carbon\Carbon::parse($request->end_date ?? now()->endOfMonth());

            foreach ($rawEvents as $event) {
                $expandedEvents = $expandedEvents->concat($event->expandInstances($searchStart, $searchEnd));
            }

            // Handle Holiday (Libur) collisions
            $holidays = $expandedEvents->filter(fn($e) => $e->event_type === 'libur')
                ->map(fn($e) => $e->start_date->format('Y-m-d'))
                ->unique()
                ->toArray();

            $finalEvents = $expandedEvents->map(function ($event) use ($holidays) {
                // If there's a holiday on this day and this isn't a holiday event, mark as cancelled
                if ($event->event_type !== 'libur' && in_array($event->start_date->format('Y-m-d'), $holidays)) {
                    $event->is_cancelled = true;
                    $event->cancel_reason = 'Dibatalkan karena hari libur';
                }
                return $event;
            });

            return response()->json($finalEvents);
        }

        $events = $query->orderBy('start_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($events);
    }

    /**
     * Get single event
     */
    public function show(Event $event)
    {
        $event->load('creator:id,name');

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    /**
     * Create new event
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'event_type' => 'required|in:latihan,ujian,pentas,libur,other',
            'color' => 'nullable|string|max:7',
            'recurrence_type' => 'nullable|in:none,daily,weekly,monthly',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_days' => 'nullable|array',
            'recurrence_until' => 'nullable|date|after:start_date',
        ]);

        try {
            $event = Event::create([
                'title' => $request->title,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'location' => $request->location,
                'event_type' => $request->event_type,
                'color' => $request->color ?? '#3b82f6',
                'recurrence_type' => $request->recurrence_type ?? 'none',
                'recurrence_interval' => $request->recurrence_interval ?? 1,
                'recurrence_days' => $request->recurrence_days,
                'recurrence_until' => $request->recurrence_until,
                'created_by' => auth()->id(),
            ]);

            $event->load('creator:id,name');

            return response()->json([
                'success' => true,
                'message' => 'Event berhasil ditambahkan',
                'data' => $event,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan event: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update event
     */
    public function update(Request $request, Event $event)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'event_type' => 'required|in:latihan,ujian,pentas,libur,other',
            'color' => 'nullable|string|max:7',
            'recurrence_type' => 'nullable|in:none,daily,weekly,monthly',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_days' => 'nullable|array',
            'recurrence_until' => 'nullable|date|after:start_date',
        ]);

        try {
            $event->update($request->only([
                'title',
                'description',
                'start_date',
                'end_date',
                'location',
                'event_type',
                'color',
                'recurrence_type',
                'recurrence_interval',
                'recurrence_days',
                'recurrence_until',
            ]));

            $event->load('creator:id,name');

            return response()->json([
                'success' => true,
                'message' => 'Event berhasil diupdate',
                'data' => $event,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate event: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete event
     */
    public function destroy(Event $event)
    {
        try {
            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus event: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel event
     */
    public function cancel(Request $request, Event $event)
    {
        $request->validate([
            'cancel_reason' => 'required|string',
        ]);

        try {
            $event->update([
                'is_cancelled' => true,
                'cancel_reason' => $request->cancel_reason,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event berhasil dibatalkan',
                'data' => $event,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan event: ' . $e->getMessage(),
            ], 500);
        }
    }
}
