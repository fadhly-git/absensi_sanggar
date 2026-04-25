import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationItem,
} from '@/components/ui/pagination';

interface Pagination {
    currentPage: number;
    totalPages: number;
    perPage: number;
    totalRows: number;
}

interface Props {
    pagination: Pagination;
    isLoading?: boolean;
    onPageChange: (p: number) => void;
    getPaginationRange: (currentPage: number, totalPages: number, windowSize?: number) => number[];
}

export const AbsensiPagination: React.FC<Props> = ({ pagination, isLoading, onPageChange, getPaginationRange }) => {
    if (!pagination) return null;
    return (
        <div className="p-4 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.totalRows)} dari {pagination.totalRows} data
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => onPageChange(pagination.currentPage - 1)} aria-disabled={pagination.currentPage === 1 || isLoading} />
                        </PaginationItem>

                        {getPaginationRange(pagination.currentPage, pagination.totalPages, 5).map(page => (
                            <PaginationItem key={page}>
                                <PaginationLink isActive={page === pagination.currentPage} onClick={() => onPageChange(page)}>{page}</PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext onClick={() => onPageChange(pagination.currentPage + 1)} aria-disabled={pagination.currentPage === pagination.totalPages || isLoading} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default AbsensiPagination;
