export const AbsensiLegend = () => (
    <div className="flex gap-6 items-center flex-wrap my-2 mx-auto">
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-green-300 bg-green-50 text-green-500 text-base">
                &#10003;
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-200">Hadir</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-red-300 bg-red-50 text-red-500 text-base">
                &#10006;
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-200">Tidak Hadir</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-yellow-300 bg-yellow-50 text-yellow-500 text-base">
                !
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-200">Bonus</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 bg-gray-50 text-gray-500 text-base">
                ?
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-200">Status Lainnya</span>
        </div>
    </div>
);