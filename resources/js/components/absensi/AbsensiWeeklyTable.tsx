import React, { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    User,
    MapPin,
    Calendar,
    Check,
    Star,
    X,
    Users,
    ArrowUpDown
} from "lucide-react";

interface AbsensiWeeklyRow {
    siswa_id: number;
    siswa_nama: string;
    siswa_alamat: string;
    [tanggal: string]: string | number | undefined;
}

interface Props {
    data: AbsensiWeeklyRow[];
    sundays: string[];
    isLoading?: boolean;
    title?: string;
    weekRange?: string;
}

const STATUS_MAP: Record<string, {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: React.ComponentType<{ className?: string }>;
}> = {
    H: {
        label: "Hadir",
        color: "border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20",
        bgColor: "bg-emerald-500",
        textColor: "text-emerald-700 dark:text-emerald-300",
        icon: Check
    },
    B: {
        label: "Bonus",
        color: "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20",
        bgColor: "bg-blue-500",
        textColor: "text-blue-700 dark:text-blue-300",
        icon: Star
    },
    T: {
        label: "Tidak Hadir",
        color: "border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20",
        bgColor: "bg-red-500",
        textColor: "text-red-700 dark:text-red-300",
        icon: X
    }
};

const LoadingSkeleton: React.FC = () => (
    <div className="w-full space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Tidak Ada Data Absensi
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            Belum ada data absensi untuk periode ini. Data akan muncul setelah absensi pertama dilakukan.
        </p>
    </div>
);

const StatusLegend: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Keterangan Status
        </h4>
        <div className="flex flex-wrap gap-4">
            {Object.entries(STATUS_MAP).map(([key, status]) => {
                const IconComponent = status.icon;
                return (
                    <div key={key} className="flex items-center gap-2">
                        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${status.bgColor}`}>
                            <IconComponent className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{status.label}</span>
                    </div>
                );
            })}
        </div>
    </div>
);

// Format date helper function
const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    return { day, month };
};

export const AbsensiWeeklyTable: React.FC<Props> = ({
    data,
    sundays,
    isLoading,
    title = "Absensi Mingguan",
    weekRange
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const toggleRowExpansion = (siswaId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(siswaId)) {
            newExpanded.delete(siswaId);
        } else {
            newExpanded.add(siswaId);
        }
        setExpandedRows(newExpanded);
    };

    const sortedData = [...data].sort((a, b) => {
        const comparison = a.siswa_nama.localeCompare(b.siswa_nama);
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const toggleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data || data.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="w-full space-y-6 mx-auto px-4 sm:px-6 lg:px-8 pt-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    {weekRange && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {weekRange}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{data.length} siswa</span>
                    </div>
                    <button
                        onClick={toggleSort}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Nama</span>
                        {sortOrder === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            <StatusLegend />

            {/* Desktop Table */}
            <div className="hidden lg:block">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 text-left w-64">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Siswa
                                            </span>
                                        </div>
                                    </th>
                                    <th className="sticky left-64 z-20 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 text-left w-48">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Alamat
                                            </span>
                                        </div>
                                    </th>
                                    {sundays.map((tgl) => {
                                        return (
                                            <th key={tgl} className="px-4 py-4 text-center min-w-[120px]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                                        Min
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {tgl}
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.map((row, idx) => (
                                    <tr key={row.siswa_id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-6 py-4 w-64">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
                                                    {row.siswa_nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {row.siswa_nama}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {row.siswa_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="sticky left-64 z-10 bg-white dark:bg-gray-800 px-6 py-4 w-48">
                                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate block">
                                                {row.siswa_alamat || "-"}
                                            </span>
                                        </td>
                                        {sundays.map((tgl) => {
                                            const val = row[tgl] as string | undefined;
                                            const status = STATUS_MAP[val ?? "T"];
                                            const IconComponent = status.icon;
                                            return (
                                                <td key={tgl} className="px-4 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${status.color} ${status.textColor}`}>
                                                            <IconComponent className="w-3.5 h-3.5" />
                                                            <span>{status.label}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-4">
                {sortedData.map((row, idx) => {
                    const isExpanded = expandedRows.has(row.siswa_id);
                    const attendanceCount = sundays.reduce((count, tgl) => {
                        const val = row[tgl] as string | undefined;
                        return val === 'H' || val === 'B' ? count + 1 : count;
                    }, 0);

                    return (
                        <div key={row.siswa_id || idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                                            {row.siswa_nama.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 dark:text-white truncate">
                                                {row.siswa_nama}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {row.siswa_alamat || "-"}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                Kehadiran: {attendanceCount}/{sundays.length}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleRowExpansion(row.siswa_id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                {/* Preview (always visible) */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {sundays.slice(0, 3).map((tgl) => {
                                        const val = row[tgl] as string | undefined;
                                        const status = STATUS_MAP[val ?? "T"];
                                        const IconComponent = status.icon;
                                        const { day, month } = formatDateDisplay(tgl);
                                        return (
                                            <div key={tgl} className="flex flex-col items-center">
                                                <div className="text-xs text-gray-400 mb-1 text-center">
                                                    <div className="font-semibold">{day}</div>
                                                    <div className="text-[10px]">{month}</div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border ${status.color} ${status.textColor}`}>
                                                    <IconComponent className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">{status.label}</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {sundays.length > 3 && !isExpanded && (
                                        <div className="flex items-center justify-center">
                                            <span className="text-xs text-gray-400 px-2 py-1">
                                                +{sundays.length - 3} lainnya
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded content */}
                                {isExpanded && sundays.length > 3 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-3 gap-3">
                                            {sundays.slice(3).map((tgl) => {
                                                const val = row[tgl] as string | undefined;
                                                const status = STATUS_MAP[val ?? "T"];
                                                const IconComponent = status.icon;
                                                const { day, month } = formatDateDisplay(tgl);
                                                return (
                                                    <div key={tgl} className="flex flex-col items-center">
                                                        <div className="text-xs text-gray-400 mb-1 text-center">
                                                            <div className="font-semibold">{day}</div>
                                                            <div className="text-[10px]">{month}</div>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color} ${status.textColor}`}>
                                                            <IconComponent className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">{status.label}</span>
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};