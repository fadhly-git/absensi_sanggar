"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: Date | undefined
  onChange: (date?: Date) => void
  label?: string
  placeholder?: string
  description?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Pick a date",
  description,
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label className="px-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-between text-left font-normal transition-all hover:bg-accent text-foreground",
              !value && "text-muted-foreground",
              open && "ring-2 ring-ring ring-offset-2"
            )}
            disabled={disabled}
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              {value ? format(value, "PPP") : <span>{placeholder}</span>}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 opacity-50 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <div className="p-4 bg-popover text-popover-foreground">
            <div className="w-72 sm:w-80 md:w-96">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  onChange(date)
                  setOpen(false) // Otomatis tutup setelah pilih
                }}
                captionLayout="dropdown"
                toYear={new Date().getFullYear() + 10}
                className="w-full text-foreground"
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
    </div>
  )
}
