import React from 'react';

type Props = {
    title: string;
    subtitle?: React.ReactNode;
    total?: number;
};

export function SiswaHeader({ title, subtitle, total }: Props) {
    return (
        <div className="w-full sm:max-w-xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-slate-600 mt-1 text-sm sm:text-base">{subtitle}</p>
                    )}
                </div>

                {typeof total === 'number' && (
                    <div className="hidden sm:flex items-center bg-gradient-to-r from-indigo-50 to-transparent rounded-lg px-3 py-1.5">
                        <div className="text-xs text-slate-500 mr-2">Total</div>
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-indigo-600 text-white font-medium text-sm">
                            {total}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SiswaHeader;
