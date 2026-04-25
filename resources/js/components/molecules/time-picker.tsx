"use client"

import * as React from "react"
import { Clock, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
    value: string | undefined // Format: HH:mm
    onChange: (time: string) => void
    label?: string
    placeholder?: string
    description?: string
    className?: string
    disabled?: boolean
    id?: string
    name?: string
}

export function TimePicker({
    value,
    onChange,
    label,
    placeholder = "Pilih waktu",
    description,
    className,
    disabled,
    id,
    name,
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const generatedId = React.useId()
    const uniqueId = id || generatedId

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

    const selectedHour = value?.split(':')[0] || '00'
    const selectedMinute = value?.split(':')[1] || '00'

    const handleHourSelect = (hour: string) => {
        onChange(`${hour}:${selectedMinute}`)
    }

    const handleMinuteSelect = (minute: string) => {
        onChange(`${selectedHour}:${minute}`)
    }

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
                            !value && "text-muted-foreground",
                            open && "ring-2 ring-ring ring-offset-2"
                        )}
                        disabled={disabled}
                    >
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 opacity-70" />
                            {value ? (
                                <span>{value}</span>
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

                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex h-64 h-full max-h-[300px] bg-popover text-popover-foreground">
                        {/* Hours */}
                        <ScrollArea className="w-20 border-r">
                            <div className="flex flex-col p-2">
                                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Jam</div>
                                {hours.map((h) => (
                                    <Button
                                        key={h}
                                        variant={selectedHour === h ? "default" : "ghost"}
                                        className="h-8 w-full justify-center text-sm font-normal"
                                        onClick={() => handleHourSelect(h)}
                                    >
                                        {h}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Minutes */}
                        <ScrollArea className="w-20">
                            <div className="flex flex-col p-2">
                                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Menit</div>
                                {minutes.map((m) => (
                                    <Button
                                        key={m}
                                        variant={selectedMinute === m ? "default" : "ghost"}
                                        className="h-8 w-full justify-center text-sm font-normal"
                                        onClick={() => handleMinuteSelect(m)}
                                    >
                                        {m}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="p-2 border-t flex justify-end">
                        <Button size="sm" onClick={() => setOpen(false)}>Selesai</Button>
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
