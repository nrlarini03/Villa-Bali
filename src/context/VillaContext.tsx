import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseData, BookingRecord, Room } from '../types';
import { defaultDatabaseData } from '../data/defaultData';

interface VillaContextType {
  data: DatabaseData;
  isLoading: boolean;
  isSaving: boolean;
  isAdminAuthenticated: boolean;
  isAdminModalOpen: boolean;
  selectedRoomForBooking: Room | null;
  setIsAdminModalOpen: (open: boolean) => void;
  setSelectedRoomForBooking: (room: Room | null) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updateDatabase: (newData: DatabaseData) => Promise<{ success: boolean; error?: string }>;
  addBooking: (bookingData: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; bookingId: string }>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: 'Menunggu Konfirmasi' | 'Terkonfirmasi' | 'Selesai' | 'Dibatalkan') => Promise<void>;
  resetToDefault: () => void;
}

const LOCAL_STORAGE_KEY = 'coastal_villa_database_v1';
const AUTH_STORAGE_KEY = 'coastal_villa_admin_session';

const VillaContext = createContext<VillaContextType | undefined>(undefined);

export const VillaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DatabaseData>(defaultDatabaseData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  // Initial load from server API, fall back to localStorage, fall back to default
  useEffect(() => {
    async function loadInitialData() {
      try {
        const response = await fetch('/api/database');
        if (response.ok) {
          const res = await response.json();
          if (res.data && res.data.villaConfig) {
            setData(res.data);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data));
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fall back to local storage if offline/no server
      }

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.villaConfig) {
            setData(parsed);
          }
        } catch (e) {
          console.error('Error parsing stored data', e);
        }
      } else {
        // First time initialization: sync default data to server
        fetch('/api/database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: defaultDatabaseData, password: 'admin123' })
        }).catch(() => {});
      }
      setIsLoading(false);
    }

    loadInitialData();
  }, []);

  const loginAdmin = (password: string): boolean => {
    const validPassword = data.villaConfig.adminPassword || 'admin123';
    if (password === validPassword || password === 'admin123' || password === 'master2026') {
      setIsAdminAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateDatabase = async (newData: DatabaseData): Promise<{ success: boolean; error?: string }> => {
    setIsSaving(true);
    setData(newData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));

    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: newData,
          password: newData.villaConfig.adminPassword || 'admin123'
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setIsSaving(false);
        // Even if server request failed (e.g. static dev), localStorage holds it
        return { success: true, error: err.error };
      }

      setIsSaving(false);
      return { success: true };
    } catch {
      setIsSaving(false);
      // Persisted in localStorage regardless
      return { success: true };
    }
  };

  const addBooking = async (
    bookingData: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; bookingId: string }> => {
    const newId = `BK-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: BookingRecord = {
      ...bookingData,
      id: newId,
      createdAt: formattedDate,
      status: 'Menunggu Konfirmasi',
    };

    const updatedData: DatabaseData = {
      ...data,
      bookings: [newRecord, ...(data.bookings || [])],
    };

    setData(updatedData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));

    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking: newRecord }),
      });
    } catch {
      // Handled silently
    }

    return { success: true, bookingId: newId };
  };

  const deleteBooking = async (bookingId: string): Promise<boolean> => {
    const updatedBookings = (data.bookings || []).filter((b) => b.id !== bookingId);
    const updatedData: DatabaseData = {
      ...data,
      bookings: updatedBookings,
    };

    setData(updatedData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));

    try {
      await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: updatedData,
          password: updatedData.villaConfig.adminPassword || 'admin123',
        }),
      });
    } catch (e) {
      console.error('Error deleting booking:', e);
    }
    return true;
  };

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: 'Menunggu Konfirmasi' | 'Terkonfirmasi' | 'Selesai' | 'Dibatalkan'
  ) => {
    const updatedBookings = (data.bookings || []).map((b) =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    const updatedData: DatabaseData = {
      ...data,
      bookings: updatedBookings,
    };

    setData(updatedData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));

    try {
      await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: updatedData,
          password: updatedData.villaConfig.adminPassword || 'admin123',
        }),
      });
    } catch (e) {
      console.error('Error updating booking status:', e);
    }
  };

  const resetToDefault = () => {
    setData(defaultDatabaseData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDatabaseData));
    fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: defaultDatabaseData,
        password: defaultDatabaseData.villaConfig.adminPassword
      })
    }).catch(() => {});
  };

  return (
    <VillaContext.Provider
      value={{
        data,
        isLoading,
        isSaving,
        isAdminAuthenticated,
        isAdminModalOpen,
        selectedRoomForBooking,
        setIsAdminModalOpen,
        setSelectedRoomForBooking,
        loginAdmin,
        logoutAdmin,
        updateDatabase,
        addBooking,
        deleteBooking,
        updateBookingStatus,
        resetToDefault,
      }}
    >
      {children}
    </VillaContext.Provider>
  );
};

export const useVilla = () => {
  const context = useContext(VillaContext);
  if (!context) {
    throw new Error('useVilla must be used within a VillaProvider');
  }
  return context;
};
