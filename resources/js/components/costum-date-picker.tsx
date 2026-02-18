import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState('');

  // Sync dari parent
  React.useEffect(() => {
    if (value) {
      setInput(format(value, 'yyyy-MM-dd'));
    } else {
      setInput('');
    }
  }, [value]);

  const handleInputChange = (val: string) => {
    setInput(val);

    if (val.length !== 10) {
      setError('');
      onChange(undefined);
      return;
    }

    const parsed = parse(val, 'yyyy-MM-dd', new Date());

    if (!isValid(parsed)) {
      setError('Invalid date format');
      onChange(undefined);
      return;
    }

    setError('');
    onChange(parsed);
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      <Popover>
        <div className="flex w-full">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="yyyy-MM-dd"
            className="rounded-r-none"
            inputMode="numeric"
          />

          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="rounded-l-none px-3"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          align="start"
          className="w-auto p-0 max-w-[95vw]"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              if (date) {
                setInput(format(date, 'yyyy-MM-dd'));
                setError('');
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
