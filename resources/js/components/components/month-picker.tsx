import { Button } from '@/components/ui/button';
import { MonthPicker } from '@/components/ui/monthpicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';

interface MonthPickerProps {
    onMonthChange: (month: string) => void;
}

export function CustomMonthPicker({ onMonthChange }: MonthPickerProps) {
    const [date, setDate] = React.useState<Date>();
    const formattedDate = date ? format(date, 'yyyy-MM') : null;

    React.useEffect(() => {
        if (formattedDate) {
            onMonthChange(formattedDate);
        }
    }, [formattedDate, onMonthChange]);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={'outline'} className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'yyyy-MM') : <span>Pick a month</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <MonthPicker onMonthSelect={setDate} selectedMonth={date} />
                </PopoverContent>
            </Popover>
        </>
    );
}
