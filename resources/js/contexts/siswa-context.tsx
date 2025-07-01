import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { siswaApi } from '@/lib/api/siswa-api';

export interface Siswa {
    id: number;
    nama: string;
    alamat: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface SiswaStats {
    siswa_aktif: number;
    siswa_nonaktif: number;
    total_siswa: number;
}

interface SiswaState {
    siswa: Siswa[];
    stats: SiswaStats | null;
    loading: boolean;
    error: string | null;
    searchTerm: string;
    selectedSiswa: Siswa | null;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

type SiswaAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SISWA'; payload: { data: Siswa[]; pagination: any } }
    | { type: 'SET_STATS'; payload: SiswaStats }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'SET_SELECTED_SISWA'; payload: Siswa | null }
    | { type: 'ADD_SISWA'; payload: Siswa }
    | { type: 'UPDATE_SISWA'; payload: Siswa }
    | { type: 'DELETE_SISWA'; payload: number }
    | { type: 'RESET' };

const initialState: SiswaState = {
    siswa: [],
    stats: null,
    loading: false,
    error: null,
    searchTerm: '',
    selectedSiswa: null,
    pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    },
};

function siswaReducer(state: SiswaState, action: SiswaAction): SiswaState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_SISWA':
            return {
                ...state,
                siswa: action.payload.data,
                pagination: {
                    current_page: action.payload.pagination.current_page,
                    last_page: action.payload.pagination.last_page,
                    per_page: action.payload.pagination.per_page,
                    total: action.payload.pagination.total,
                },
                loading: false,
                error: null
            };
        case 'SET_STATS':
            return { ...state, stats: action.payload, loading: false, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        case 'SET_SELECTED_SISWA':
            return { ...state, selectedSiswa: action.payload };
        case 'ADD_SISWA':
            return {
                ...state,
                siswa: [action.payload, ...state.siswa],
                pagination: {
                    ...state.pagination,
                    total: state.pagination.total + 1,
                }
            };
        case 'UPDATE_SISWA':
            return {
                ...state,
                siswa: state.siswa.map(s => s.id === action.payload.id ? action.payload : s),
            };
        case 'DELETE_SISWA':
            return {
                ...state,
                siswa: state.siswa.filter(s => s.id !== action.payload),
                pagination: {
                    ...state.pagination,
                    total: Math.max(0, state.pagination.total - 1),
                }
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

interface SiswaContextType {
    state: SiswaState;
    actions: {
        fetchSiswa: (page?: number) => Promise<void>;
        fetchStats: () => Promise<void>;
        createSiswa: (data: Omit<Siswa, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
        updateSiswa: (id: number, data: Partial<Siswa>) => Promise<void>;
        deleteSiswa: (id: number) => Promise<void>;
        setSearchTerm: (term: string) => void;
        setSelectedSiswa: (siswa: Siswa | null) => void;
        reset: () => void;
    };
}

const SiswaContext = createContext<SiswaContextType | undefined>(undefined);

export function SiswaProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(siswaReducer, initialState);

    // Memoized actions untuk menghindari re-render yang tidak perlu
    const actions = useMemo(() => ({
        fetchSiswa: useCallback(async (page = 1) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const response = await siswaApi.getAll(page, state.searchTerm);
                dispatch({
                    type: 'SET_SISWA',
                    payload: {
                        data: response.data,
                        pagination: response
                    }
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch siswa';
                dispatch({ type: 'SET_ERROR', payload: message });
                toast.error('Gagal memuat data siswa', { description: message });
            }
        }, [state.searchTerm]),

        fetchStats: useCallback(async () => {
            try {
                const stats = await siswaApi.getStats();
                dispatch({ type: 'SET_STATS', payload: stats });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch stats';
                dispatch({ type: 'SET_ERROR', payload: message });
                toast.error('Gagal memuat statistik siswa', { description: message });
            }
        }, []),

        createSiswa: useCallback(async (data: Omit<Siswa, 'id' | 'created_at' | 'updated_at'>) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const newSiswa = await siswaApi.create(data);
                dispatch({ type: 'ADD_SISWA', payload: newSiswa });
                toast.success('Siswa berhasil ditambahkan');
                // Refresh stats setelah menambah siswa
                actions.fetchStats();
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to create siswa';
                dispatch({ type: 'SET_ERROR', payload: message });
                toast.error('Gagal menambahkan siswa', { description: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }, []),

        updateSiswa: useCallback(async (id: number, data: Partial<Siswa>) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const updatedSiswa = await siswaApi.update(id, data);
                dispatch({ type: 'UPDATE_SISWA', payload: updatedSiswa });
                toast.success('Data siswa berhasil diperbarui');
                actions.fetchStats();
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to update siswa';
                dispatch({ type: 'SET_ERROR', payload: message });
                toast.error('Gagal memperbarui data siswa', { description: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }, []),

        deleteSiswa: useCallback(async (id: number) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                await siswaApi.delete(id);
                dispatch({ type: 'DELETE_SISWA', payload: id });
                toast.success('Siswa berhasil dihapus');
                actions.fetchStats();
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to delete siswa';
                dispatch({ type: 'SET_ERROR', payload: message });
                toast.error('Gagal menghapus siswa', { description: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }, []),

        setSearchTerm: useCallback((term: string) => {
            dispatch({ type: 'SET_SEARCH_TERM', payload: term });
        }, []),

        setSelectedSiswa: useCallback((siswa: Siswa | null) => {
            dispatch({ type: 'SET_SELECTED_SISWA', payload: siswa });
        }, []),

        reset: useCallback(() => {
            dispatch({ type: 'RESET' });
        }, []),
    }), [state.searchTerm]);

    const contextValue = useMemo(() => ({
        state,
        actions,
    }), [state, actions]);

    return (
        <SiswaContext.Provider value={contextValue}>
            {children}
        </SiswaContext.Provider>
    );
}

export function useSiswa() {
    const context = useContext(SiswaContext);
    if (context === undefined) {
        throw new Error('useSiswa must be used within a SiswaProvider');
    }
    return context;
}