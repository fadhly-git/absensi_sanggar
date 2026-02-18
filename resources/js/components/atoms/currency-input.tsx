import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { formatCurrency } from "@/lib/utils";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: number;
    onValueChange: (value: number) => void;
}

export const CurrencyInput = ({ value, onValueChange, ...props }: CurrencyInputProps) => {
    const [display, setDisplay] = useState(formatCurrency(value));

    useEffect(() => setDisplay(value ? formatCurrency(value) : ''), [value]);

    const parseNumber = (s: string) => {
        const digits = s.replace(/[^0-9]/g, '');
        return digits === '' ? 0 :Number(digits);
    }
    return (
        <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
            const n = parseNumber(e.target.value);
            setDisplay(n === 0 && e.target.value.replace(/[^0-9]/g, '') === '' ? '' : formatCurrency(n));
            onValueChange(n);
        }}
        onFocus={(e) => {
            // const n = parseNumber(display);
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);

        }}
        onBlur={() => setDisplay(value ? formatCurrency(value) : '')}
        />
    )
}
