import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ExportButtonProps {
    priode: string;
    mode: string;
}

export const ExportButton = ({ priode, mode }: ExportButtonProps) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const handleExport = async () => {
        try {
            // Get current filter parameters
            const params = {
                periode: priode,
                mode: mode,
                limit: '200', // Convert limit to a string
            };

            // Convert params to URL query string
            const queryString = new URLSearchParams(params).toString();

            // Trigger download
            window.open(`/atmin/export-absen?${queryString}`, '_blank');
        } catch (error) {
            setOpen(true);
            setMessage(String(error));

            // console.error('Export failed:', error);
            // alert('Export failed. Please try again.');
        }
    };
    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Export failed. Please try again.</AlertDialogTitle>
                        <AlertDialogDescription>{message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" className="hover:bg-green-500 hover:text-white" onClick={handleExport}>
                Export Data
            </Button>
        </>
    );
};
