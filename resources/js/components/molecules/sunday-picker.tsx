"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown, Info } from "lucide-react"
import { id as idLocale } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SundayPickerProps {
  value: Date | undefined
  onChange: (date?: Date) => void
  label?: string
  placeholder?: string
  description?: string
  className?: string
  disabled?: boolean
  showWarning?: boolean
  id?: string
  name?: string
}

/**
 * Get nearest Sunday from a given date
 * - If today is Sunday, return today
 * - If today is Monday-Wednesday, return last Sunday
 * - If today is Thursday-Saturday, return next Sunday
 */
export function getNearestSunday(date: Date = new Date()): Date {
  const dayOfWeek = date.getDay()
  const sunday = new Date(date)

  if (dayOfWeek === 0) {
    // Already Sunday
    return sunday
  } else if (dayOfWeek <= 3) {
    // Monday to Wednesday - get last Sunday
    sunday.setDate(date.getDate() - dayOfWeek)
  } else {
    // Thursday to Saturday - get next Sunday
    sunday.setDate(date.getDate() + (7 - dayOfWeek))
  }

  sunday.setHours(0, 0, 0, 0)
  return sunday
}

/**
 * Check if a date is Sunday
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0
}

export function SundayPicker({
  value,
  onChange,
  label,
  placeholder = "Pilih hari Minggu",
  description,
  className,
  disabled,
  showWarning = true,
  id,
  name = "sunday-picker",
}: SundayPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(value)
  const generatedId = React.useId()
  const uniqueId = id || generatedId

  // Sync internal value with prop value
  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Warning if selected date is not Sunday
  const isNotSunday = internalValue && !isSunday(internalValue)

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      setInternalValue(undefined)
      onChange(undefined)
      return
    }

    // Only allow Sunday selection
    if (isSunday(date)) {
      setInternalValue(date)
      onChange(date)
      setOpen(false)
    }
  }

  // Disable non-Sunday dates
  const disabledDates = React.useCallback((date: Date) => {
    return date.getDay() !== 0 // Disable all days except Sunday
  }, [])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor={uniqueId} className="px-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={uniqueId}
            name={name}
            variant={"outline"}
            className={cn(
              "w-full justify-between text-left font-normal transition-all hover:bg-accent text-foreground",
              !internalValue && "text-muted-foreground",
              open && "ring-2 ring-ring ring-offset-2",
              isNotSunday && "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
            )}
            disabled={disabled}
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              {internalValue ? (
                <span>
                  {format(internalValue, "EEEE, dd MMMM yyyy", { locale: idLocale })}
                </span>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 opacity-50 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <div className="p-4 bg-popover text-popover-foreground">
            <div className="mb-3 rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <Info className="w-4 h-4 inline-block mr-1" /> Hanya hari Minggu yang dapat dipilih
              </p>
            </div>

            <div className="w-72 sm:w-80 md:w-96">
              <Calendar
                mode="single"
                selected={internalValue}
                onSelect={handleSelect}
                disabled={disabledDates}
                captionLayout="dropdown"
                toYear={new Date().getFullYear() + 2}
                fromYear={new Date().getFullYear() - 1}
                defaultMonth={internalValue || getNearestSunday()}
                className="w-full text-foreground"
                locale={idLocale}
                modifiers={{
                  sunday: (date) => date.getDay() === 0
                }}
                modifiersClassNames={{
                  sunday: "font-bold text-primary"
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {description && (
        <p className="px-1 text-[0.8rem] text-muted-foreground">
          {description}
        </p>
      )}

      {showWarning && isNotSunday && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠️ Perhatian: Tanggal yang dipilih bukan hari Minggu.
            Silakan pilih hari Minggu untuk absensi.
          </p>
        </div>
      )}
    </div>
  )
}
