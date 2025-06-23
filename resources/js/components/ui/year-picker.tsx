import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

type YearCalProps = {
    selectedYear?: Date;
    onYearSelect?: (date: Date) => void;
    onDecadeForward?: () => void;
    onDecadeBackward?: () => void;
    callbacks?: {
        yearLabel?: (year: number) => string;
    };
    variant?: {
        calendar?: {
            main?: ButtonVariant;
            selected?: ButtonVariant;
        };
        chevrons?: ButtonVariant;
    };
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
};

type ButtonVariant = "default" | "outline" | "ghost" | "link" | "destructive" | "secondary" | null | undefined;

function YearPicker({
    onYearSelect,
    selectedYear,
    minDate,
    maxDate,
    disabledDates,
    callbacks,
    onDecadeBackward,
    onDecadeForward,
    variant,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & YearCalProps) {
    return (
        <div className={cn("min-w-[200px] w-[280px] p-3", className)} {...props}>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
                <div className="space-y-4 w-full">
                    <YearCal
                        onYearSelect={onYearSelect}
                        callbacks={callbacks}
                        selectedYear={selectedYear}
                        onDecadeBackward={onDecadeBackward}
                        onDecadeForward={onDecadeForward}
                        variant={variant}
                        minDate={minDate}
                        maxDate={maxDate}
                        disabledDates={disabledDates}
                    ></YearCal>
                </div>
            </div>
        </div>
    );
}

function YearCal({ selectedYear, onYearSelect, callbacks, variant, minDate, maxDate, disabledDates, onDecadeBackward, onDecadeForward }: YearCalProps) {
    const [year, setYear] = React.useState<number>(selectedYear?.getFullYear() ?? new Date().getFullYear());
    const [decadeStart, setDecadeStart] = React.useState<number>(Math.floor(year / 10) * 10);

    if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

    const disabledDatesMapped = disabledDates?.map((d) => {
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const years = Array.from({ length: 10 }, (_, i) => decadeStart + i);

    return (
        <>
            <div className="flex justify-center pt-1 relative items-center">
                <div className="text-sm font-medium">{decadeStart} - {decadeStart + 9}</div>
                <div className="space-x-1 flex items-center">
                    <button
                        onClick={() => {
                            setDecadeStart(decadeStart - 10);
                            if (onDecadeBackward) onDecadeBackward();
                        }}
                        className={cn(buttonVariants({ variant: variant?.chevrons ?? "outline" }), "inline-flex items-center justify-center h-7 w-7 p-0 absolute left-1")}
                    >
                        <ChevronLeft className="opacity-50 h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            setDecadeStart(decadeStart + 10);
                            if (onDecadeForward) onDecadeForward();
                        }}
                        className={cn(buttonVariants({ variant: variant?.chevrons ?? "outline" }), "inline-flex items-center justify-center h-7 w-7 p-0 absolute right-1")}
                    >
                        <ChevronRight className="opacity-50 h-4 w-4" />
                    </button>
                </div>
            </div>
            <table className="w-full border-collapse space-y-1">
                <tbody>
                    <tr className="flex w-full mt-2 flex-wrap">
                        {years.map((y) => {
                            return (
                                <td
                                    key={y}
                                    className="h-10 w-1/4 text-center text-sm p-0 relative"
                                >
                                    <button
                                        onClick={() => {
                                            setYear(y);
                                            if (onYearSelect) onYearSelect(new Date(y, 0));
                                        }}
                                        disabled={
                                            (maxDate ? y > maxDate?.getFullYear() : false) ||
                                            (minDate ? y < minDate?.getFullYear() : false) ||
                                            (disabledDatesMapped ? disabledDatesMapped?.some((d) => d.year == y) : false)
                                        }
                                        className={cn(
                                            buttonVariants({ variant: year == y ? variant?.calendar?.selected ?? "default" : variant?.calendar?.main ?? "ghost" }),
                                            "h-full w-full p-0 font-normal aria-selected:opacity-100"
                                        )}
                                    >
                                        {callbacks?.yearLabel ? callbacks.yearLabel(y) : y}
                                    </button>
                                </td>
                            );
                        })}
                    </tr>
                </tbody>
            </table>
        </>
    );
}

YearPicker.displayName = "YearPicker";

export { YearPicker };