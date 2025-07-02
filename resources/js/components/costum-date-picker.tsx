import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';

interface datepickerProps {
    date: Date | undefined;
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    className?: string; // Tambahkan className opsional untuk styling tambahan
}

export function DatePicker({ date, setDate, className }: datepickerProps) {
    const [stringDate, setStringDate] = React.useState<string>('');
    const [dates, setDates] = React.useState<Date | undefined>(date);
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    // Efek samping untuk sinkronisasi `date` dari props ke state lokal
    React.useEffect(() => {
        if (parse(date?.toString() || '', 'yyyy-MM-dd', new Date())) {
            setDates(date); // Sinkronkan `dates` dengan `date` dari props
            setStringDate(format(date ?? new Date(), 'yyyy-MM-dd')); // Format ulang `stringDate`
        } else {
            setDates(undefined);
            setStringDate('');
        }
    }, [date]);

    return (
        <Popover>
            <div className={`relative ${className}`}>
                <div className="w-full flex justify-center items-center">
                    {/* Input Field */}
                    <Input
                        className={'w-full'}
                        type="text"
                        value={stringDate}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            setStringDate(inputValue);

                            // Validasi tanggal
                            const parsedDate = inputValue.length == 10 ? parse(inputValue, 'yyyy-MM-dd', new Date()) : undefined;
                            if (!parsedDate) {
                                setErrorMessage('Invalid Date'); // Menghindari error saat parsing string kosong
                            }
                            if (!isValid(parsedDate)) {
                                setErrorMessage('Invalid Date');
                            } else {
                                // console.log('else :' + parsedDate);
                                setErrorMessage('');
                                setDates(parsedDate);
                                setDate(parsedDate); // Perbarui `date` di komponen induk
                            }
                        }}
                        placeholder="yyyy-MM-dd"
                    />
                    {/* Pesan Error */}
                    {errorMessage && (
                        <div className="absolute bottom-[-1.75rem] left-0 text-sm text-red-400">
                            {errorMessage} {stringDate}
                        </div>
                    )}
                </div>
                {/* Tombol Calendar */}
                <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn('absolute top-[50%] right-0 translate-y-[-50%] rounded-l-none font-normal', !dates && 'text-muted-foreground')}
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
            </div>
            {/* Popover Content (Calendar Picker) */}
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={dates}
                    onSelect={(selectedDate) => {
                        if (!selectedDate) return;

                        // Perbarui state lokal dan komponen induk
                        setDates(selectedDate);
                        setStringDate(format(selectedDate, 'yyyy-MM-dd'));
                        setDate(selectedDate);
                        setErrorMessage('');
                    }}
                    defaultMonth={date}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
