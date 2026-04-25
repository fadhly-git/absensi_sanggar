# Sunday Picker Component

Komponen date picker khusus yang hanya memungkinkan user memilih hari Minggu. Dirancang untuk sistem absensi sanggar yang hanya beroperasi di hari Minggu.

## Features

- ✅ **Hanya hari Minggu** - User hanya bisa memilih tanggal yang jatuh di hari Minggu
- ✅ **Auto-select nearest Sunday** - Default value otomatis ke hari Minggu terdekat
- ✅ **Visual feedback** - Hari Minggu ditampilkan dengan styling khusus
- ✅ **Validasi built-in** - Warning jika user memilih tanggal non-Minggu
- ✅ **Responsive** - Tampilan optimal di semua ukuran layar
- ✅ **Dark mode support** - Otomatis mengikuti theme
- ✅ **Accessible** - Keyboard navigation dan screen reader friendly

## Installation

Komponen ini sudah tersedia di:
```
resources/js/components/molecules/sunday-picker.tsx
```

## Usage

### Basic Usage

```tsx
import { SundayPicker } from '@/components/molecules/sunday-picker';

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <SundayPicker
      value={date}
      onChange={setDate}
    />
  );
}
```

### With Default Value (Nearest Sunday)

```tsx
import { SundayPicker, getNearestSunday } from '@/components/molecules/sunday-picker';

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(getNearestSunday());

  return (
    <SundayPicker
      value={date}
      onChange={setDate}
      label="Tanggal Absensi"
      description="Pilih hari Minggu untuk melakukan absensi"
    />
  );
}
```

### With Custom Styling

```tsx
<SundayPicker
  value={date}
  onChange={setDate}
  label="Pilih Tanggal"
  placeholder="Silakan pilih hari Minggu"
  className="w-full max-w-md"
  showWarning={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| undefined` | - | Current selected date |
| `onChange` | `(date?: Date) => void` | - | Callback when date changes |
| `label` | `string` | - | Label above the picker |
| `placeholder` | `string` | `"Pilih hari Minggu"` | Placeholder text |
| `description` | `string` | - | Helper text below the picker |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the picker |
| `showWarning` | `boolean` | `true` | Show warning for non-Sunday dates |

## Helper Functions

### `getNearestSunday(date?: Date): Date`

Mendapatkan hari Minggu terdekat dari tanggal yang diberikan.

**Logic:**
- Jika hari ini Minggu → return hari ini
- Jika hari ini Senin-Rabu → return Minggu kemarin
- Jika hari ini Kamis-Sabtu → return Minggu depan

```tsx
const nearestSunday = getNearestSunday(); // Minggu terdekat dari hari ini
const sundayFromSpecificDate = getNearestSunday(new Date('2024-03-15'));
```

### `isSunday(date: Date): boolean`

Cek apakah tanggal adalah hari Minggu.

```tsx
const sunday = new Date('2024-03-17'); // Minggu
const monday = new Date('2024-03-18'); // Senin

isSunday(sunday); // true
isSunday(monday); // false
```

## Examples

### 1. QR Scanner Page

```tsx
import { SundayPicker, getNearestSunday, isSunday } from '@/components/molecules/sunday-picker';
import { toast } from 'sonner';

export default function QrScanner() {
  const nearestSunday = getNearestSunday();
  const [date, setDate] = useState<Date | undefined>(nearestSunday);

  useEffect(() => {
    if (date && !isSunday(date)) {
      toast.error('Absensi hanya dapat dilakukan pada hari Minggu');
    }
  }, [date]);

  return (
    <div>
      <SundayPicker
        value={date}
        onChange={setDate}
        label="Tanggal Absensi"
        showWarning={false}
      />
    </div>
  );
}
```

### 2. Absensi Input Dialog

```tsx
import { SundayPicker, getNearestSunday } from '@/components/molecules/sunday-picker';

export function AbsensiInputDialog({ tanggal, setTanggal }) {
  const tanggalDate = tanggal ? new Date(tanggal) : undefined;

  return (
    <Dialog>
      <SundayPicker
        value={tanggalDate}
        onChange={(date) => {
          if (date) {
            setTanggal(date.toISOString().slice(0, 10));
          }
        }}
        placeholder="Pilih hari Minggu"
        description="Absensi hanya dapat dilakukan pada hari Minggu"
      />
    </Dialog>
  );
}
```

### 3. Daftar Hadir Page

```tsx
function DaftarHadir() {
  const getNearestSunday = (date = new Date()) => {
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);

    if (dayOfWeek === 0) {
      return sunday.toISOString().slice(0, 10);
    } else if (dayOfWeek <= 3) {
      sunday.setDate(date.getDate() - dayOfWeek);
    } else {
      sunday.setDate(date.getDate() + (7 - dayOfWeek));
    }

    return sunday.toISOString().slice(0, 10);
  };

  const [selectedDate, setSelectedDate] = useState(getNearestSunday());

  // ... rest of component
}
```

## Backend Validation

Backend juga memvalidasi bahwa tanggal adalah hari Minggu:

```php
// AbsensiController.php
public function absensiQr(Request $request)
{
    $tanggal = $scanResult['tanggal'] ?? date('Y-m-d');

    // Validasi: hanya izinkan absensi pada hari Minggu
    $tanggalCarbon = \Carbon\Carbon::parse($tanggal);
    if ($tanggalCarbon->dayOfWeek !== \Carbon\Carbon::SUNDAY) {
        return response()->json([
            'success' => false,
            'message' => 'Absensi hanya dapat dilakukan pada hari Minggu'
        ], 400);
    }

    // ... rest of logic
}
```

## Zod Validation

Untuk form validation dengan Zod:

```typescript
import { z } from "zod"
import { isSunday } from "@/components/molecules/sunday-picker"

export const absensiSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal wajib dipilih",
  }).refine((date) => isSunday(date), {
    message: "Absensi hanya dapat dilakukan pada hari Minggu",
  }),
})
```

## Styling

### Custom Sunday Styling

```tsx
// In Calendar component
modifiers={{
  sunday: (date) => date.getDay() === 0
}}
modifiersClassNames={{
  sunday: "font-bold text-primary"
}}
```

### Warning State

Ketika non-Sunday date dipilih, komponen otomatis menampilkan warning:

```tsx
{showWarning && isNotSunday && (
  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
    <p className="text-xs text-amber-600">
      ⚠️ Perhatian: Tanggal yang dipilih bukan hari Minggu
    </p>
  </div>
)}
```

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus management
- ✅ Disabled state support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `date-fns` - Date manipulation
- `date-fns/locale/id` - Indonesian locale
- `@radix-ui/react-popover` - Popover component
- `lucide-react` - Icons

## Tips

1. **Default to nearest Sunday**: Selalu gunakan `getNearestSunday()` untuk default value
2. **Show warnings**: Enable `showWarning` untuk better UX
3. **Backend validation**: Selalu validasi di backend juga
4. **Error handling**: Handle case dimana user mencoba submit non-Sunday date

## Migration from DatePicker

Jika sebelumnya menggunakan `DatePicker`, migration mudah:

```tsx
// Before
import { DatePicker } from '@/components/molecules/date-picker';
<DatePicker value={date} onChange={setDate} />

// After
import { SundayPicker, getNearestSunday } from '@/components/molecules/sunday-picker';
const [date, setDate] = useState(getNearestSunday());
<SundayPicker value={date} onChange={setDate} />
```

## License

MIT
