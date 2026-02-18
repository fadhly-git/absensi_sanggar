import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, Settings, UserRoundPlus } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from './ui/button';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { props } = usePage() as { props: { csrfToken: string } };

    const logout = () => {
        router.post(
            route('logout'),
            {
                _token: props.csrfToken,
            },
            {
                onSuccess: () => {
                    localStorage.removeItem('token');
                },
                onError: (error) => {
                    console.error('Logout failed:', error);
                },
            }
        );
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {(user.role === 'admin' || user.role === 'pengurus') && (
                <>
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link className="block w-full" href={route('register')} as="button" prefetch onClick={cleanup}>
                                <UserRoundPlus className="mr-2" />
                                Register
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuItem asChild>
                <Button className="flex justify-start w-full" onClick={() => { cleanup(); logout(); }}>
                    <LogOut className="mr-2" />
                    Log out
                </Button>
            </DropdownMenuItem>

        </>
    );
}
