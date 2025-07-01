# Siswa Excel Export Feature

## Overview
This feature allows exporting active students data to Excel format following the existing export patterns in the application.

## Usage

### API Endpoint
```
GET /api/atmin/siswa/export-excel
```

### Web Endpoint  
```
GET /atmin/export-siswa
```

### Response
- **Success**: Downloads Excel file with name `siswa_aktif_YYYY-MM-DD.xlsx`
- **No Data**: Returns JSON with 404 status and message "Tidak ada data siswa aktif untuk diekspor."

## Excel File Structure

| Column | Description |
|---------|-------------|
| Nama Siswa | Student's full name |
| Alamat | Student's address |
| Status | "Aktif" for active students (status=1) |

## Implementation Details

### Files Created/Modified
- `app/Exports/SiswaExport.php` - Export class
- `app/Http/Controllers/SiswaCon.php` - Added exportExcel method
- `routes/api.php` - Added API route
- `routes/web.php` - Added web route
- `database/factories/SiswaFactory.php` - Factory for testing
- `tests/Feature/SiswaExportTest.php` - Test cases

### Data Filtering
Only students with:
- `status = 1` (active)
- Not soft-deleted (Laravel's soft delete handling)

### Dependencies
- Uses existing Maatwebsite\Excel package
- Follows existing export patterns from AttendanceExport

## Example Usage

### From Controller/Service
```php
use App\Http\Controllers\SiswaCon;

$controller = new SiswaCon();
$response = $controller->exportExcel();
```

### Direct Export Class Usage
```php
use App\Models\Siswa;
use App\Exports\SiswaExport;
use Maatwebsite\Excel\Facades\Excel;

$activeSiswa = Siswa::where('status', 1)->get();
return Excel::download(new SiswaExport($activeSiswa), 'siswa_aktif_' . date('Y-m-d') . '.xlsx');
```