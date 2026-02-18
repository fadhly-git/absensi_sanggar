import React, { useState } from 'react';

interface Person {
    id: number;
    nama: string;
    alamat: string;
    status: number;
}

interface TableWithSwitchProps {
    data: Person[];
}

export const TableWithSwitch: React.FC<TableWithSwitchProps> = ({ data }) => {
    const [attendance, setAttendance] = useState(
        data.reduce(
            (acc, person) => {
                acc[person.id] = person.status === 1;
                return acc;
            },
            {} as Record<number, boolean>,
        ),
    );

    const handleToggle = (id: number) => {
        setAttendance((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        <th className="border-b border-gray-200 px-6 py-3">Nama</th>
                        <th className="border-b border-gray-200 px-6 py-3">Alamat</th>
                        <th className="w-1 border-b border-gray-200 px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((person) => (
                        <tr key={person.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4 whitespace-nowrap">{person.nama}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{person.alamat}</td>
                            <td className="w-1 px-6 py-4 whitespace-nowrap">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                        checked={attendance[person.id]}
                                        onChange={() => handleToggle(person.id)}
                                    />
                                    <span className="ml-2">{attendance[person.id] ? 'Berangkat' : 'Tidak Berangkat'}</span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
