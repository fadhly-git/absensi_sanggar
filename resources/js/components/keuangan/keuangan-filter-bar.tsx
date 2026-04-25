import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { Card } from '@/components/ui/card';

interface Props {
  isMonthMode: boolean;
  date: string;
  onModeChange: (checked: boolean) => void;
  onDateChange: (val: string) => void;
  children?: React.ReactNode;
}

export const KeuanganFilterBar: React.FC<Props> = ({ isMonthMode, onModeChange, onDateChange, children }) => {
  return (
    <Card className="w-full bg-background">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Periode</Label>
            <Tabs
              defaultValue={isMonthMode ? 'month' : 'year'}
              onValueChange={(val) => onModeChange(val === 'month')}
            >
              <TabsList className="grid w-[200px] grid-cols-2 bg-muted/5 rounded-md p-1">
                <TabsTrigger value="year" className="text-sm">
                  Tahun
                </TabsTrigger>
                <TabsTrigger value="month" className="text-sm">
                  Bulan
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-2 w-full max-w-xs">
            {isMonthMode ? (
              <CustomMonthPicker onMonthChange={onDateChange} />
            ) : (
              <CustomYearPicker onYearChange={onDateChange} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">{children}</div>
      </div>
    </Card>
  );
};

export default KeuanganFilterBar;
