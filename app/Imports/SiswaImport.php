<?php

namespace App\Imports;

use App\Models\Siswa;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;

class SiswaImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsOnFailure
{
    use Importable, SkipsErrors, SkipsFailures;

    private $successCount = 0;
    private $failedCount = 0;
    private $errors = [];

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        try {
            // Map column names (adjust based on your Excel headers)
            $nama = $row['nama_siswa'] ?? $row['nama'] ?? null;
            $alamat = $row['alamat_lengkap'] ?? $row['alamat'] ?? null;
            $status = $row['status'] ?? 1;

            // Convert status to boolean
            if (is_string($status)) {
                $status = strtolower($status) === 'aktif' || $status === '1' ? 1 : 0;
            } else {
                $status = (int) $status;
            }

            $siswa = Siswa::create([
                'nama' => $nama,
                'alamat' => $alamat,
                'status' => $status,
            ]);

            $this->successCount++;
            return $siswa;

        } catch (\Exception $e) {
            $this->failedCount++;
            $this->errors[] = "Row " . ($this->successCount + $this->failedCount) . ": " . $e->getMessage();
            return null;
        }
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            '*.nama_siswa' => 'required|string|min:2|max:255',
            '*.alamat_lengkap' => 'required|string|min:5|max:1000',
            '*.status' => 'required|in:0,1,aktif,non-aktif,Aktif,Non-Aktif',
        ];
    }

    /**
     * @return array
     */
    public function customValidationMessages()
    {
        return [
            '*.nama_siswa.required' => 'Nama siswa harus diisi',
            '*.nama_siswa.min' => 'Nama siswa minimal 2 karakter',
            '*.alamat_lengkap.required' => 'Alamat harus diisi',
            '*.alamat_lengkap.min' => 'Alamat minimal 5 karakter',
            '*.status.required' => 'Status harus diisi',
            '*.status.in' => 'Status harus berupa: 0, 1, aktif, atau non-aktif',
        ];
    }

    public function getSuccessCount(): int
    {
        return $this->successCount;
    }

    public function getFailedCount(): int
    {
        return $this->failedCount;
    }

    public function getErrors(): array
    {
        return array_merge($this->errors, $this->failures());
    }
}