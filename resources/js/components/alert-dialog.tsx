import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertProps {
    type: string;
    open: boolean;
    openDialog: () => void;
    remove: () => void;
}

export function DialogAlert({ type, open, openDialog, remove }: AlertProps) {
    const title = type == 'delete' ? 'Are you absolutely sure?' : 'Are you sure?';

    const handleAction = () => {
        openDialog();
        remove();
    };
    return (
        <AlertDialog open={open} onOpenChange={openDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAction}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
