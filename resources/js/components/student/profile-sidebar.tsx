// resources/js/components/student/profile-sidebar.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInitials } from '@/hooks/use-initials';
import { Siswa } from '@/types/siswa';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar, MapPin, TrendingUp, User } from 'lucide-react';
import { ProfileSkeleton } from './skeleton/profile-skeleton';

interface ProfileSidebarProps {
    data: Siswa | undefined;
    isLoading?: boolean;
    showEditButton?: boolean;
}

export function ProfileSidebar({ data, isLoading, showEditButton = true }: ProfileSidebarProps) {
    const getInitials = useInitials();

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <aside className="bg-card mx-auto flex w-full max-w-xl flex-col rounded-xl border shadow-sm lg:mx-0">
            <div className="flex flex-col items-center p-4 sm:p-6">
                <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-32 sm:w-32 ring-4 ring-offset-2 ring-offset-background ring-primary/20">
                        <AvatarImage src={data?.foto} alt={data?.nama} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-3xl font-bold">
                            {getInitials(data?.nama ?? '')}
                        </AvatarFallback>
                    </Avatar>
                    <span
                        className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-background ${
                            data?.status ? 'bg-green-500' : 'bg-muted'
                        }`}
                    />
                </div>

                <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl font-bold capitalize">{data?.nama ?? '-'}</h2>

                {data?.alamat && (
                    <div className="text-muted-foreground mt-1 flex items-start gap-1.5 text-sm">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="line-clamp-2 text-center capitalize">{data.alamat}</span>
                    </div>
                )}
            </div>

            <Separator />

            <div className="space-y-4 p-6">
                <ProfileInfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Status"
                    value={
                        <Badge
                            variant={data?.status ? 'default' : 'secondary'}
                            className={
                                data?.status
                                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            }
                        >
                            {data?.status ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                    }
                />

                <ProfileInfoItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Statistik Absensi"
                    value={
                        <div className="flex gap-3 text-sm">
                            <span className="bg-muted rounded-md px-2 py-1">
                                Total: <strong>{data?.total_absensi ?? 0}</strong>
                            </span>
                            <span className="bg-muted rounded-md px-2 py-1">
                                Bulan ini: <strong>{data?.absensi_bulan_ini ?? 0}</strong>
                            </span>
                        </div>
                    }
                />

                <ProfileInfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Terdaftar"
                    value={
                        <span className="text-muted-foreground text-sm">
                            {data?.tanggal_terdaftar
                                ? formatDistanceToNow(new Date(data.tanggal_terdaftar), {
                                      addSuffix: true,
                                      locale: localeId,
                                  })
                                : '-'}
                        </span>
                    }
                />
            </div>

            {showEditButton && (
                <div className="p-6 pt-0">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => (window.location.href = route('profile.edit'))}
                    >
                        Edit Profil
                    </Button>
                </div>
            )}
        </aside>
    );
}

interface ProfileInfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

function ProfileInfoItem({ icon, label, value }: ProfileInfoItemProps) {
    return (
        <div className="space-y-1.5">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                {icon}
                {label}
            </div>
            <div>{value}</div>
        </div>
    );
}
