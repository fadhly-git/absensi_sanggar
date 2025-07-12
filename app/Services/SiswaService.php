<?php

namespace App\Services;

use App\Models\Siswa;
use App\Models\User;
use App\Http\Resources\SiswaResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class SiswaService
{
    /**
     * Get paginated siswa with filters
     */
    public function getPaginated($params)
    {
        $query = Siswa::with(['user', 'absensis'])
            ->leftJoin('users', 'siswas.user_id', '=', 'users.id')
            ->select(['siswas.*', 'users.name as nama_user']);

        if (!empty($params['search'])) {
            $searchTerm = $params['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('users.name', 'like', "%{$searchTerm}%")
                    ->orWhere('siswas.alamat', 'like', "%{$searchTerm}%");
            });
        }

        if (isset($params['status']) && $params['status'] !== 'all') {
            $status = $params['status'] === '1' ? true : false;
            $query->where('siswas.status', $status);
        }

        $sortBy = $params['sortBy'] ?? 'nama_user';
        $sortOrder = $params['sortOrder'] ?? 'asc';
        $allowedSortFields = ['nama_user', 'alamat', 'created_at', 'status'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($params['per_page'] ?? 10, 100);
        $siswa = $query->paginate($perPage);

        $siswa->getCollection()->load(['user', 'absensis']);

        return [
            'data' => SiswaResource::collection($siswa->items()),
            'current_page' => $siswa->currentPage(),
            'last_page' => $siswa->lastPage(),
            'per_page' => $siswa->perPage(),
            'total' => $siswa->total(),
            'from' => $siswa->firstItem(),
            'to' => $siswa->lastItem(),
        ];
    }

    /**
     * Create new siswa and user
     */
    public function store(array $validated)
    {
        return DB::transaction(function () use ($validated) {
            $tanggal_terdaftar = Carbon::now()->toDateString();
            $tahun_masuk = Carbon::now()->year;
            $count = Siswa::withTrashed()->whereYear('tanggal_terdaftar', $tahun_masuk)->count();
            $inisial = strtolower(env('INITIAL_CODE', 'stnlb'));
            $nis = $tahun_masuk . $inisial . sprintf('%04d', $count + 1);

            $user = User::create([
                'name' => ucwords(strtolower($validated['nama'])),
                'email' => $nis . '@ngelaras.my.id',
                'password' => Hash::make($nis),
                'role' => 'siswa',
                'nis' => $nis,
            ]);

            $siswa = Siswa::create([
                'nama' => ucwords(strtolower($validated['nama'])),
                'alamat' => $validated['alamat'],
                'status' => $validated['status'],
                'tanggal_terdaftar' => $tanggal_terdaftar,
                'user_id' => $user->id,
            ]);

            $qrData = [
                'id' => $siswa->id,
                'nama' => $siswa->nama,
                'tanggal_terdaftar' => $siswa->tanggal_terdaftar,
            ];
            $fileName = "qr_siswa/siswa_{$siswa->id}_{$siswa->nama}.png";
            Storage::disk('public')->put($fileName, QrCode::format('png')
                ->size(300)
                ->generate(json_encode($qrData)));

            // Update the siswa record with the QR code path
            $siswa->qrcode_path = $fileName;
            $siswa->save();

            return $siswa;
        });
    }

    /**
     * Update siswa
     */
    public function update(Siswa $siswa, array $validated)
    {
        return DB::transaction(function () use ($siswa, $validated) {
            $siswa->update($validated);
            return $siswa->fresh();
        });
    }

    /**
     * Soft delete siswa
     */
    public function delete(Siswa $siswa)
    {
        return DB::transaction(function () use ($siswa) {
            $siswa->delete();
            return true;
        });
    }

    /**
     * Restore siswa
     */
    public function restore(Siswa $siswa)
    {
        return DB::transaction(function () use ($siswa) {
            $siswa->restore();
            return $siswa->fresh();
        });
    }

    /**
     * Force delete siswa (permanent)
     */
    public function forceDelete(Siswa $siswa)
    {
        return DB::transaction(function () use ($siswa) {
            if ($siswa->absensis()->count() > 0) {
                throw new \Exception('Tidak dapat menghapus permanen. Siswa memiliki riwayat absensi.');
            }
            $siswa->forceDelete();
            return true;
        });
    }

    /**
     * Bulk action
     */
    public function bulkAction(string $action, array $ids)
    {
        switch ($action) {
            case 'activate':
                return Siswa::whereIn('id', $ids)->update(['status' => true]);
            case 'deactivate':
                Log::info('Bulk action deactivating siswa', [
                    'user_id' => auth()->id(),
                    'ids' => $ids
                ]);
                return Siswa::whereIn('id', $ids)->update(['status' => false]);
            case 'delete':
                return Siswa::whereIn('id', $ids)->delete();
            case 'restore':
                return Siswa::withTrashed()->whereIn('id', $ids)->restore();
            default:
                throw new \InvalidArgumentException('Aksi tidak valid');
        }
    }

    /**
     * Statistik siswa
     */
    public function getCount()
    {
        return Siswa::count();
    }

    public function getCountAktif()
    {
        return Siswa::where('status', true)->count();
    }

    public function getTrashed($params)
    {
        $query = Siswa::onlyTrashed();

        if (!empty($params['search'])) {
            $searchTerm = $params['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                    ->orWhere('alamat', 'like', "%{$searchTerm}%");
            });
        }

        $perPage = min($params['per_page'] ?? 10, 100);
        return $query->orderBy('deleted_at', 'desc')->paginate($perPage);
    }
}