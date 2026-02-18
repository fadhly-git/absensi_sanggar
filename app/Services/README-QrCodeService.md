# QR Code Service

Service untuk generate QR code siswa dengan logo dan nama.

## Features

- ✅ Generate QR code dengan logo sanggar
- ✅ Otomatis menambahkan nama siswa di bawah QR code
- ✅ Struktur folder berdasarkan tahun masuk siswa
- ✅ Support batch/bulk generation
- ✅ Fallback jika logo/font tidak tersedia
- ✅ Logging untuk monitoring
- ✅ Error handling yang robust

## Requirements

- SimpleSoftwareIO QrCode package
- Intervention Image package
- Logo file: `public/img/logo.png`
- Font file (optional): `public/fonts/OpenSans-Bold.ttf`

## Usage

### 1. Generate QR Code untuk Single Siswa

```php
use App\Services\QrCodeService;
use App\Models\Siswa;

$qrCodeService = app(QrCodeService::class);
$siswa = Siswa::find(1);

// Generate QR code
$qrPath = $qrCodeService->generateQrCode($siswa);

// Force regenerate (overwrite existing)
$qrPath = $qrCodeService->generateQrCode($siswa, $forceRegenerate = true);
```

### 2. Generate QR Code untuk Multiple Siswa (Batch)

```php
$siswaIds = [1, 2, 3, 4, 5];
$result = $qrCodeService->generateBulkQrCodes($siswaIds);

// Result:
// [
//     'success_count' => 5,
//     'failed_count' => 0,
//     'errors' => []
// ]
```

### 3. Delete QR Code

```php
$siswa = Siswa::find(1);
$qrCodeService->deleteQrCode($siswa);
```

## Integrasi di Controller

### SiswaController (Create)

Service sudah otomatis dipanggil saat create siswa baru melalui `SiswaService`:

```php
// Di SiswaService@store
public function store(array $validated)
{
    return DB::transaction(function () use ($validated) {
        // ... create user & siswa
        
        // Generate QR code otomatis
        $this->qrCodeService->generateQrCode($siswa);
        
        return $siswa->fresh();
    });
}
```

### SiswaController (Import)

Service otomatis dipanggil setelah import Excel:

```php
// Di SiswaController@import
$import = new SiswaImport();
Excel::import($import, $request->file('file'));

// Generate QR codes untuk siswa yang baru diimport
$import->generateQrCodes();
```

### Student\Absensi Controller

```php
// Generate/regenerate QR code
public function generateQrCode($id)
{
    $siswa = Siswa::findOrFail($id);
    $qrPath = $this->qrCodeService->generateQrCode($siswa, true);
    // ...
}

// Get QR code (auto generate jika belum ada)
public function getQr($id)
{
    $siswa = Siswa::findOrFail($id);
    
    if (!$siswa->qrcode_path) {
        $this->qrCodeService->generateQrCode($siswa);
    }
    // ...
}
```

## Artisan Command

Generate QR code untuk semua siswa via command:

```bash
# Generate untuk siswa yang belum punya QR code
php artisan generate:qr-siswa

# Force regenerate semua QR code
php artisan generate:qr-siswa --force
```

## QR Code Structure

### Folder Structure
```
storage/app/public/qrcodes/
├── 2024/
│   ├── 1-john-doe.png
│   ├── 2-jane-smith.png
│   └── ...
├── 2025/
│   ├── 10-alice-johnson.png
│   └── ...
└── umum/
    └── 99-no-registration-date.png
```

### QR Code Data Format
```json
{
    "id": 1,
    "nama": "John Doe",
    "tanggal_terdaftar": "2024-01-15"
}
```

### Image Specifications
- **Size**: 300x360 pixels
- **QR Code**: 300x300 pixels
- **Text Area**: 300x60 pixels
- **Format**: PNG
- **Background**: White (#ffffff)

## Error Handling

Service memiliki error handling yang comprehensive:

```php
try {
    $qrPath = $qrCodeService->generateQrCode($siswa);
    
    if (!$qrPath) {
        // QR code generation failed
        // Error sudah di-log
    }
} catch (\Exception $e) {
    // Handle exception
}
```

## Logging

Semua operasi QR code di-log untuk monitoring:

```php
// Success
Log::info('QR code generated successfully', [
    'siswa_id' => $siswa->id,
    'siswa_nama' => $siswa->nama,
    'qr_path' => $fileName
]);

// Error
Log::error('Failed to generate QR code', [
    'siswa_id' => $siswa->id,
    'error' => $e->getMessage()
]);
```

## Testing

```php
// Test generate QR code
$siswa = Siswa::factory()->create();
$qrPath = app(QrCodeService::class)->generateQrCode($siswa);
$this->assertNotNull($qrPath);
$this->assertTrue(Storage::disk('public')->exists($qrPath));

// Test batch generation
$siswaIds = Siswa::factory()->count(5)->create()->pluck('id')->toArray();
$result = app(QrCodeService::class)->generateBulkQrCodes($siswaIds);
$this->assertEquals(5, $result['success_count']);
$this->assertEquals(0, $result['failed_count']);
```

## Troubleshooting

### Logo tidak muncul di QR code
- Pastikan file `public/img/logo.png` ada
- Service akan fallback generate QR tanpa logo jika file tidak ada

### Font tidak sesuai
- Pastikan file `public/fonts/OpenSans-Bold.ttf` ada
- Service akan fallback ke system default font jika file tidak ada

### QR code tidak ter-generate
- Check log di `storage/logs/laravel.log`
- Pastikan folder `storage/app/public/qrcodes` writable
- Run `php artisan storage:link` jika belum

### Permission error
```bash
chmod -R 775 storage/app/public/qrcodes
```

## API Routes

```php
// Generate QR code untuk siswa
POST /siswa/{id}/generate-qr

// Get QR code image
GET /siswa/{id}/qr
```

## Dependencies

```json
{
    "simplesoftwareio/simple-qrcode": "^4.2",
    "intervention/image": "^2.7"
}
```

## License

MIT
