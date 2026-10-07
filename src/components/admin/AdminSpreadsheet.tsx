import React, { useState, useRef } from 'react';
import { useVilla } from '../../context/VillaContext';
import { DatabaseData, Room, Facility, GalleryItem } from '../../types';
import { formatIDR } from '../../data/defaultData';
import { uploadImageFile } from '../../utils/imageUpload';
import {
  Save,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Check,
  FileSpreadsheet,
  Settings,
  Bed,
  Sparkles,
  Calendar,
  LogOut,
  ExternalLink,
  KeyRound,
  MessageCircle,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface AdminSpreadsheetProps {
  onClose: () => void;
}

export const AdminSpreadsheet: React.FC<AdminSpreadsheetProps> = ({ onClose }) => {
  const {
    data,
    updateDatabase,
    logoutAdmin,
    resetToDefault,
    deleteBooking,
    updateBookingStatus,
  } = useVilla();

  // Local working copy for editing before saving
  const [formData, setFormData] = useState<DatabaseData>(JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState<'settings' | 'rooms' | 'facilities' | 'gallery' | 'bookings' | 'spreadsheet' | 'googlesheets'>('settings');
  const [spreadsheetSubTab, setSpreadsheetSubTab] = useState<'rooms' | 'facilities' | 'gallery' | 'bookings'>('rooms');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Sync formData whenever context data changes
  React.useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  // Handle immediate booking deletion without blocked window.confirm
  const handleDeleteBooking = async (bookingId: string) => {
    const updated = formData.bookings.filter((b) => b.id !== bookingId);
    setFormData({
      ...formData,
      bookings: updated,
    });
    await deleteBooking(bookingId);
    setSaveStatus(`Booking ${bookingId} berhasil dihapus dari database! Tanggal kamar telah dibuka kembali.`);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Handle immediate status update
  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    const updated = formData.bookings.map((item) =>
      item.id === bookingId ? { ...item, status: newStatus } : item
    );
    setFormData({ ...formData, bookings: updated });
    await updateBookingStatus(bookingId, newStatus);
    setSaveStatus(`Status ${bookingId} berhasil diubah ke "${newStatus}".`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Google Sheets state
  const [googleSheetInputUrl, setGoogleSheetInputUrl] = useState<string>(formData.villaConfig.googleSheetsUrl || '');
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [sheetsSyncMsg, setSheetsSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preset images
  const presetImages = [
    { label: 'Villa Hero Pantai', url: '/src/assets/images/coastal_villa_hero_1791329436122.jpg' },
    { label: 'Ocean Suite Bedroom', url: '/src/assets/images/villa_ocean_suite_1791329449477.jpg' },
    { label: 'Sunset Pool Deck', url: '/src/assets/images/villa_sunset_pool_1791329463871.jpg' },
    { label: 'Living Pavilion', url: '/src/assets/images/villa_living_pavilion_1791329474512.jpg' },
  ];

  // File input refs
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload for Hero Banner
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImageFile(file, 'hero_banner');
      setFormData({
        ...formData,
        villaConfig: {
          ...formData.villaConfig,
          heroImage: uploadedUrl,
        },
      });
      setSaveStatus('Foto hero banner berhasil diunggah! Jangan lupa klik "Simpan Perubahan".');
    } catch (err: any) {
      alert('Gagal mengunggah foto: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image upload for a specific Room
  const handleRoomImageUpload = async (file: File, roomIndex: number) => {
    try {
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImageFile(file, `kamar_${formData.rooms[roomIndex]?.name || 'room'}`);
      const updatedRooms = [...formData.rooms];
      updatedRooms[roomIndex].image = uploadedUrl;
      setFormData({
        ...formData,
        rooms: updatedRooms,
      });
      setSaveStatus(`Foto kamar "${updatedRooms[roomIndex].name}" berhasil diganti! Klik "Simpan Perubahan".`);
    } catch (err: any) {
      alert('Gagal mengunggah foto: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image upload for Gallery
  const handleAddGalleryPhoto = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImageFile(file, 'galeri_villa');
      const newPhoto: GalleryItem = {
        id: `gal-${Date.now()}`,
        title: 'Foto Baru Villa',
        category: 'Eksterior & Kolam',
        imageUrl: uploadedUrl,
        caption: 'Pemandangan indah di area villa.',
      };
      setFormData({
        ...formData,
        gallery: [newPhoto, ...formData.gallery],
      });
      setSaveStatus('Foto baru berhasil ditambahkan ke Galeri!');
    } catch (err: any) {
      alert('Gagal mengunggah foto: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save changes to database (server + local storage)
  const handleSave = async () => {
    setIsSavingLocal(true);
    setSaveStatus(null);
    const result = await updateDatabase(formData);
    setIsSavingLocal(false);
    if (result.success) {
      setSaveStatus('Perubahan berhasil disimpan ke database dan langsung aktif di website!');
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus('Gagal menyimpan: ' + (result.error || 'Terjadi kesalahan'));
    }
  };

  // Sync with Google Sheets
  const handleSyncGoogleSheets = async () => {
    if (!googleSheetInputUrl.trim()) {
      setSheetsSyncMsg({ type: 'error', text: 'Silakan masukkan tautan (URL) Google Sheets terlebih dahulu.' });
      return;
    }

    setIsSyncingSheets(true);
    setSheetsSyncMsg(null);

    try {
      const response = await fetch('/api/sync-google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: googleSheetInputUrl.trim() }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.error || 'Gagal mengambil data dari Google Sheets');
      }

      const csvText = res.csvText as string;
      const lines = csvText.split('\n').filter((l) => l.trim().length > 0);

      if (lines.length <= 1) {
        throw new Error('Spreadsheet kosong atau tidak memiliki data baris.');
      }

      // Parse CSV rows into rooms
      const importedRooms: Room[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV splitter
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3 && cols[1]) {
          importedRooms.push({
            id: cols[0] || `room-${Date.now()}-${i}`,
            name: cols[1] || 'Kamar Impor',
            type: cols[2] || 'Suite Mewah',
            pricePerNight: Number(cols[3]) || 5000000,
            capacity: Number(cols[4]) || 2,
            bedrooms: 1,
            bathrooms: 1,
            size: cols[6] || '80 m²',
            bed: cols[5] || '1 King Bed',
            image: cols[7] || '/src/assets/images/villa_ocean_suite_1791329449477.jpg',
            description: cols[8] || 'Deskripsi kamar tersinkronisasi otomatis dari Google Sheets.',
            features: ['Private Terrace', 'Wi-Fi Cepat', 'Ocean View', 'Breakfast Included'],
            isAvailable: true,
          });
        }
      }

      if (importedRooms.length === 0) {
        throw new Error('Format kolom tidak cocok. Pastikan menggunakan format template.');
      }

      const updated = {
        ...formData,
        villaConfig: {
          ...formData.villaConfig,
          googleSheetsUrl: googleSheetInputUrl.trim(),
        },
        rooms: importedRooms,
      };

      setFormData(updated);
      await updateDatabase(updated);

      setSheetsSyncMsg({
        type: 'success',
        text: `Berhasil menyinkronkan ${importedRooms.length} kamar langsung dari Google Sheets! Website telah otomatis diperbarui.`,
      });
    } catch (err: any) {
      setSheetsSyncMsg({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat menyambungkan ke Google Sheets.',
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // CSV Export
  const exportToCSV = (type: 'rooms' | 'bookings' | 'facilities') => {
    let csvContent = '';
    let fileName = '';

    if (type === 'rooms') {
      fileName = 'data_kamar_coastal_villa.csv';
      const headers = ['ID', 'Nama Kamar', 'Tipe', 'Harga Per Malam', 'Kapasitas', 'Bed', 'Ukuran', 'URL Gambar', 'Deskripsi'];
      const rows = formData.rooms.map((r) => [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.type.replace(/"/g, '""')}"`,
        r.pricePerNight,
        r.capacity,
        `"${r.bed.replace(/"/g, '""')}"`,
        `"${r.size.replace(/"/g, '""')}"`,
        `"${r.image.replace(/"/g, '""')}"`,
        `"${r.description.replace(/"/g, '""')}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    } else if (type === 'bookings') {
      fileName = 'data_booking_masuk.csv';
      const headers = ['ID Booking', 'Nama Tamu', 'No WA', 'Email', 'Kamar', 'Check-In', 'Check-Out', 'Malam', 'Tamu', 'Total Biaya', 'Status'];
      const rows = formData.bookings.map((b) => [
        b.id,
        `"${b.guestName.replace(/"/g, '""')}"`,
        `"${b.guestPhone}"`,
        `"${b.guestEmail || ''}"`,
        `"${b.roomName.replace(/"/g, '""')}"`,
        b.checkIn,
        b.checkOut,
        b.nights,
        b.guests,
        b.totalPrice,
        `"${b.status}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    } else if (type === 'facilities') {
      fileName = 'data_fasilitas.csv';
      const headers = ['ID', 'Kategori', 'Nama Fasilitas', 'Icon', 'Deskripsi'];
      const rows = formData.facilities.map((f) => [
        f.id,
        `"${f.category}"`,
        `"${f.name.replace(/"/g, '""')}"`,
        f.icon,
        `"${f.description.replace(/"/g, '""')}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper room row adder
  const handleAddRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: 'Suite Mewah Baru',
      type: 'Deluxe Oceanfront Suite',
      pricePerNight: 6500000,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: '95 m²',
      bed: '1 Super King Bed',
      image: '/src/assets/images/villa_ocean_suite_1791329449477.jpg',
      description: 'Kamar mewah baru dengan pemandangan langsung ke pantai dan teras pribadi.',
      features: ['Private Terrace', 'Bathtub Mewah', 'Free Breakfast', 'Wi-Fi Cepat'],
      isAvailable: true,
    };
    setFormData({
      ...formData,
      rooms: [...formData.rooms, newRoom],
    });
  };

  const handleDeleteRoom = (id: string) => {
    if (formData.rooms.length <= 1) {
      alert('Minimal harus ada 1 kamar di website!');
      return;
    }
    setFormData({
      ...formData,
      rooms: formData.rooms.filter((r) => r.id !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <span>Database & Spreadsheet Pemilik Villa</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Akses Terbuka
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Ubah nama usaha, upload/ganti foto langsung, sinkronkan Google Sheets, dan atur harga kamar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSavingLocal || isUploadingImage}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow transition-all cursor-pointer whitespace-nowrap"
            >
              {isSavingLocal || isUploadingImage ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSavingLocal ? 'Menyimpan...' : isUploadingImage ? 'Mengunggah...' : 'Simpan Perubahan'}</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
              title="Keluar / Kunci Database"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Kunci & Tutup</span>
            </button>
          </div>
        </div>

        {/* Save Status Notification Banner */}
        {saveStatus && (
          <div className="px-6 py-2.5 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center px-6 bg-neutral-950/80 border-b border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ Profil Usaha & Foto Hero</span>
          </button>

          <button
            onClick={() => setActiveTab('googlesheets')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'googlesheets'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-emerald-400 hover:text-emerald-300 font-semibold'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>🔗 Sambungkan Google Sheets (Live Sync)</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>🛏️ Kamar & Upload Foto ({formData.rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>🖼️ Galeri Foto ({formData.gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('spreadsheet')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'spreadsheet'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📊 Mode Grid Spreadsheet (Excel Style)</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>📅 Booking Masuk ({formData.bookings.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 spreadsheet-scroll bg-neutral-900">
          {/* TAB: GOOGLE SHEETS LIVE SYNC */}
          {activeTab === 'googlesheets' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-neutral-800/90 rounded-2xl p-6 sm:p-8 border border-neutral-700 space-y-6 shadow-xl">
                <div className="border-b border-neutral-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Cara Menyambungkan Website ke Google Spreadsheet
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Cukup buat Google Sheets dan masukkan tautannya ke sini. Website akan otomatis membaca data kamar, harga, dan foto dari spreadsheet Anda!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Langkah-Langkah Mudah (3 Menit):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700/80 space-y-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center">
                        1
                      </span>
                      <h5 className="font-bold text-white">Buat Spreadsheet Baru</h5>
                      <p className="text-neutral-400 leading-relaxed">
                        Buka Google Sheets di Google Drive Anda atau klik tombol download template di bawah.
                      </p>
                      <button
                        onClick={() => exportToCSV('rooms')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-600 mt-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unduh Template CSV</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700/80 space-y-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center">
                        2
                      </span>
                      <h5 className="font-bold text-white">Atur Akses Publik</h5>
                      <p className="text-neutral-400 leading-relaxed">
                        Di Google Sheets, klik tombol <strong>Bagikan</strong> (Share) di pojok kanan atas, lalu pilih <strong>"Siapa saja yang memiliki link dapat melihat"</strong> (Anyone with the link can view).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700/80 space-y-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center">
                        3
                      </span>
                      <h5 className="font-bold text-white">Tempelkan Link & Sinkronkan</h5>
                      <p className="text-neutral-400 leading-relaxed">
                        Salin link Google Sheets tersebut dan tempelkan ke kolom input di bawah ini, lalu klik <strong>Tarik & Sinkronkan Data</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Sheets Link Input Box */}
                <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-700 space-y-4">
                  <label className="text-xs font-semibold text-neutral-200 block">
                    Tautan / URL Google Sheets Anda:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit..."
                      value={googleSheetInputUrl}
                      onChange={(e) => setGoogleSheetInputUrl(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSyncGoogleSheets}
                      disabled={isSyncingSheets}
                      className="flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isSyncingSheets ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Tarik & Sinkronkan Sekarang'}</span>
                    </button>
                  </div>

                  {sheetsSyncMsg && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                        sheetsSyncMsg.type === 'success'
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/70 border border-red-500/40 text-red-300'
                      }`}
                    >
                      {sheetsSyncMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      )}
                      <span>{sheetsSyncMsg.text}</span>
                    </div>
                  )}
                </div>

                {/* Column Structure Reference */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-neutral-300">
                    Susunan Kolom Standar di Google Sheets:
                  </h5>
                  <div className="bg-neutral-950 p-3 rounded-lg text-xs font-mono text-neutral-400 overflow-x-auto">
                    ID | Nama Kamar | Tipe | Harga Per Malam | Kapasitas | Bed | Ukuran | URL Gambar | Deskripsi
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & HERO IMAGE UPLOAD */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-neutral-800/80 rounded-xl p-6 border border-neutral-700 space-y-6">
                <div className="border-b border-neutral-700 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-400" />
                    <span>Identitas Usaha & Kontak Pemilik</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Ubah nama usaha sesuai merek Anda, no. WhatsApp tujuan pemesanan, dan ganti foto hero utama.
                  </p>
                </div>

                {/* HERO BANNER IMAGE UPLOAD CARD */}
                <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Camera className="w-4 h-4" />
                        <span>Foto Hero Banner Utama Website</span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Foto besar yang tampil di bagian paling atas saat pengunjung pertama kali membuka website.
                      </p>
                    </div>

                    {/* Direct Upload Button */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={heroFileInputRef}
                        onChange={handleHeroImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Unggah Foto dari HP / Laptop</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview of current Hero Image */}
                  <div className="relative aspect-[21/9] max-h-48 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                    <img
                      src={formData.villaConfig.heroImage}
                      alt="Hero Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded text-[11px] text-neutral-300">
                      Foto Aktif
                    </div>
                  </div>

                  {/* Quick Preset Selector */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-neutral-400">Atau pilih foto preset villa:</span>
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            villaConfig: { ...formData.villaConfig, heroImage: p.url },
                          })
                        }
                        className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 transition-colors cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Website / Usaha */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Nama Website / Nama Usaha Villa <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.villaConfig.brandName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          villaConfig: { ...formData.villaConfig, brandName: e.target.value },
                        })
                      }
                      className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Tagline / Slogan Hero
                    </label>
                    <input
                      type="text"
                      value={formData.villaConfig.tagline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          villaConfig: { ...formData.villaConfig, tagline: e.target.value },
                        })
                      }
                      className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* No WhatsApp Pemilik */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      No. WhatsApp Pemilik (Format: 628...) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.villaConfig.whatsappNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          villaConfig: { ...formData.villaConfig, whatsappNumber: e.target.value },
                        })
                      }
                      placeholder="Contoh: 6281234567890"
                      className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Ketika tamu mengklik booking, pesan reservasi akan langsung terkirim ke WhatsApp ini.
                    </p>
                  </div>

                  {/* Email Villa */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Email Villa
                    </label>
                    <input
                      type="email"
                      value={formData.villaConfig.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          villaConfig: { ...formData.villaConfig, email: e.target.value },
                        })
                      }
                      className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Jam Check-In */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Waktu Check-In
                    </label>
                    <input
                      type="text"
                      value={formData.villaConfig.checkInTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          villaConfig: { ...formData.villaConfig, checkInTime: e.target.value },
                        })
                      }
                      className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Jam Check-Out */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Waktu Check-Out
                    </label>
                    <input
                      type="text"
                      value={formData.villaConfig.checkOutTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          villaConfig: { ...formData.villaConfig, checkOutTime: e.target.value },
                        })
                      }
                      className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Alamat Lengkap */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Alamat Lengkap Villa
                  </label>
                  <textarea
                    rows={2}
                    value={formData.villaConfig.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        villaConfig: { ...formData.villaConfig, address: e.target.value },
                      })
                    }
                    className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Google Maps URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Link Google Maps Lokasi
                  </label>
                  <input
                    type="url"
                    value={formData.villaConfig.googleMapsUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        villaConfig: { ...formData.villaConfig, googleMapsUrl: e.target.value },
                      })
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Password Admin Settings */}
                <div className="space-y-2 pt-4 border-t border-neutral-700">
                  <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    <span>Kata Sandi / Password Akses Database (Ganti Di Sini)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.villaConfig.adminPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        villaConfig: { ...formData.villaConfig, adminPassword: e.target.value },
                      })
                    }
                    placeholder="Masukkan password baru"
                    className="w-full sm:w-80 text-sm bg-neutral-900 border border-amber-500/50 rounded-lg px-3.5 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Hanya yang mengetahui password ini yang dapat membuka dashboard database.
                  </p>
                </div>
              </div>

              {/* Reset Option */}
              <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-300">Reset ke Data Standar</h4>
                  <p className="text-[11px] text-neutral-500">
                    Kembalikan nama, kamar, foto, dan pengaturan ke template awal Coastal Dream Villa.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetToDefault();
                    setSaveStatus('Data telah berhasil direset ke bawaan awal.');
                    setTimeout(() => setSaveStatus(null), 3000);
                  }}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Data Standar
                </button>
              </div>
            </div>
          )}

          {/* TAB: ROOMS WITH DIRECT IMAGE UPLOAD */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Daftar Kamar & Villa</h3>
                  <p className="text-xs text-neutral-400">
                    Edit nama kamar, harga per malam, fasilitas kamar, dan ganti foto kamar langsung dari perangkat.
                  </p>
                </div>
                <button
                  onClick={handleAddRoom}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 text-neutral-950 rounded-lg hover:bg-amber-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kamar Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.rooms.map((room, idx) => (
                  <div
                    key={room.id}
                    className="bg-neutral-800/80 rounded-xl p-5 border border-neutral-700 space-y-4"
                  >
                    {/* Image & Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="relative group/img w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-neutral-700">
                        <img
                          src={room.image}
                          alt={room.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {/* Hover Overlay to change image */}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                          <Camera className="w-5 h-5 text-amber-300" />
                          <span className="text-[10px] mt-1 font-semibold">Ganti Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleRoomImageUpload(file, idx);
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex-1">
                        <span className="text-[10px] uppercase text-amber-400 font-semibold block">
                          {room.type}
                        </span>
                        <h4 className="font-display text-lg font-bold text-white line-clamp-1">
                          {room.name}
                        </h4>
                        <span className="text-xs font-semibold text-amber-300 font-mono">
                          {formatIDR(room.pricePerNight)} / malam
                        </span>

                        {/* Direct File Picker Button */}
                        <div className="pt-2">
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-neutral-700 hover:bg-neutral-600 text-white rounded cursor-pointer transition-colors">
                            <Camera className="w-3 h-3 text-amber-400" />
                            <span>Unggah Foto Kamar</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleRoomImageUpload(file, idx);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                        title="Hapus Kamar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-neutral-400">Nama Kamar</label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => {
                            const updated = [...formData.rooms];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, rooms: updated });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400">Tarif / Malam (Rp)</label>
                        <input
                          type="number"
                          value={room.pricePerNight}
                          onChange={(e) => {
                            const updated = [...formData.rooms];
                            updated[idx].pricePerNight = Number(e.target.value);
                            setFormData({ ...formData, rooms: updated });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400">Kapasitas (Orang)</label>
                        <input
                          type="number"
                          value={room.capacity}
                          onChange={(e) => {
                            const updated = [...formData.rooms];
                            updated[idx].capacity = Number(e.target.value);
                            setFormData({ ...formData, rooms: updated });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400">Tipe Kasur</label>
                        <input
                          type="text"
                          value={room.bed}
                          onChange={(e) => {
                            const updated = [...formData.rooms];
                            updated[idx].bed = e.target.value;
                            setFormData({ ...formData, rooms: updated });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-neutral-400">URL Gambar (atau gunakan tombol unggah di atas)</label>
                      <input
                        type="text"
                        value={room.image}
                        onChange={(e) => {
                          const updated = [...formData.rooms];
                          updated[idx].image = e.target.value;
                          setFormData({ ...formData, rooms: updated });
                        }}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-300 focus:outline-none font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-neutral-400">Deskripsi Kamar</label>
                      <textarea
                        rows={2}
                        value={room.description}
                        onChange={(e) => {
                          const updated = [...formData.rooms];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, rooms: updated });
                        }}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GALLERY WITH DIRECT UPLOAD */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Kelola Galeri Foto Villa</h3>
                  <p className="text-xs text-neutral-400">
                    Tambahkan foto-foto villa langsung dari kamera HP atau galeri file komputer Anda.
                  </p>
                </div>

                {/* Upload to Gallery Button */}
                <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shadow">
                  <Camera className="w-4 h-4" />
                  <span>Tambah Foto Baru dari Perangkat</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAddGalleryPhoto(file);
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formData.gallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-neutral-800/80 rounded-xl overflow-hidden border border-neutral-700 space-y-3 p-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-neutral-400 text-[10px]">Judul Foto</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...formData.gallery];
                              updated[idx].title = e.target.value;
                              setFormData({ ...formData, gallery: updated });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-neutral-400 text-[10px]">Kategori</label>
                          <select
                            value={item.category}
                            onChange={(e) => {
                              const updated = [...formData.gallery];
                              updated[idx].category = e.target.value;
                              setFormData({ ...formData, gallery: updated });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white text-xs"
                          >
                            <option value="Eksterior & Kolam">Eksterior & Kolam</option>
                            <option value="Kamar Tidur">Kamar Tidur</option>
                            <option value="Living & Dining">Living & Dining</option>
                            <option value="Pemandangan Senja">Pemandangan Senja</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-700 flex justify-between items-center">
                      <label className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Ganti File Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImageFile(file, 'galeri_update');
                              const updated = [...formData.gallery];
                              updated[idx].imageUrl = url;
                              setFormData({ ...formData, gallery: updated });
                            }
                          }}
                        />
                      </label>

                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            gallery: formData.gallery.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SPREADSHEET GRID */}
          {activeTab === 'spreadsheet' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Lembar / Sheet:
                  </span>
                  <button
                    onClick={() => setSpreadsheetSubTab('rooms')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      spreadsheetSubTab === 'rooms'
                        ? 'bg-amber-400 text-neutral-950 font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    🛏️ Kamar & Harga
                  </button>
                  <button
                    onClick={() => setSpreadsheetSubTab('facilities')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      spreadsheetSubTab === 'facilities'
                        ? 'bg-amber-400 text-neutral-950 font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    🌟 Fasilitas
                  </button>
                  <button
                    onClick={() => setSpreadsheetSubTab('bookings')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      spreadsheetSubTab === 'bookings'
                        ? 'bg-amber-400 text-neutral-950 font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    📅 Log Booking
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportToCSV(spreadsheetSubTab === 'gallery' ? 'rooms' : spreadsheetSubTab)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unduh CSV (Excel)</span>
                  </button>
                </div>
              </div>

              {/* SPREADSHEET TABLE: KAMAR & HARGA */}
              {spreadsheetSubTab === 'rooms' && (
                <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-amber-300">
                      Tabel: data_kamar_villa ({formData.rooms.length} baris)
                    </span>
                    <button
                      onClick={handleAddRoom}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-400 text-neutral-950 font-semibold rounded hover:bg-amber-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris Kamar</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[500px] spreadsheet-scroll">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[11px] sticky top-0 border-b border-neutral-800 z-10">
                        <tr>
                          <th className="p-2.5 border-r border-neutral-800 w-12 text-center">No</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[200px]">Nama Kamar</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[140px]">Tipe</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[140px]">Tarif / Malam (Rp)</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[80px]">Kapasitas</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[130px]">Tipe Kasur</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[90px]">Luas</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[200px]">URL Gambar / Unggah</th>
                          <th className="p-2.5 min-w-[70px] text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 font-mono">
                        {formData.rooms.map((room, idx) => (
                          <tr key={room.id} className="hover:bg-neutral-800/60 transition-colors">
                            <td className="p-2 border-r border-neutral-800 text-center text-neutral-500">
                              {idx + 1}
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={room.name}
                                onChange={(e) => {
                                  const updated = [...formData.rooms];
                                  updated[idx].name = e.target.value;
                                  setFormData({ ...formData, rooms: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-white border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={room.type}
                                onChange={(e) => {
                                  const updated = [...formData.rooms];
                                  updated[idx].type = e.target.value;
                                  setFormData({ ...formData, rooms: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-white border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="number"
                                value={room.pricePerNight}
                                onChange={(e) => {
                                  const updated = [...formData.rooms];
                                  updated[idx].pricePerNight = Number(e.target.value);
                                  setFormData({ ...formData, rooms: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-amber-300 font-bold border-none focus:bg-neutral-800 focus:outline-none rounded tabular-nums"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="number"
                                value={room.capacity}
                                onChange={(e) => {
                                  const updated = [...formData.rooms];
                                  updated[idx].capacity = Number(e.target.value);
                                  setFormData({ ...formData, rooms: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-center text-white border-none focus:bg-neutral-800 focus:outline-none rounded tabular-nums"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={room.bed}
                                onChange={(e) => {
                                  const updated = [...formData.rooms];
                                  updated[idx].bed = e.target.value;
                                  setFormData({ ...formData, rooms: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-white border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={room.size}
                                onChange={(e) => {
                                  const updated = [...formData.rooms];
                                  updated[idx].size = e.target.value;
                                  setFormData({ ...formData, rooms: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-white border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={room.image}
                                  onChange={(e) => {
                                    const updated = [...formData.rooms];
                                    updated[idx].image = e.target.value;
                                    setFormData({ ...formData, rooms: updated });
                                  }}
                                  className="flex-1 bg-transparent px-1 py-1 text-neutral-400 text-[11px] border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                                />
                                <label className="p-1 text-neutral-400 hover:text-amber-400 cursor-pointer">
                                  <Camera className="w-3.5 h-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleRoomImageUpload(file, idx);
                                    }}
                                  />
                                </label>
                              </div>
                            </td>
                            <td className="p-1 text-center">
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SPREADSHEET TABLE: FASILITAS */}
              {spreadsheetSubTab === 'facilities' && (
                <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-amber-300">
                      Tabel: data_fasilitas ({formData.facilities.length} baris)
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[500px] spreadsheet-scroll">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[11px] sticky top-0 border-b border-neutral-800 z-10">
                        <tr>
                          <th className="p-2.5 border-r border-neutral-800 w-12 text-center">No</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[150px]">Kategori</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[200px]">Nama Fasilitas</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[110px]">Icon (Lucide)</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[300px]">Deskripsi Singkat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 font-mono">
                        {formData.facilities.map((fac, idx) => (
                          <tr key={fac.id} className="hover:bg-neutral-800/60 transition-colors">
                            <td className="p-2 border-r border-neutral-800 text-center text-neutral-500">
                              {idx + 1}
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={fac.category}
                                onChange={(e) => {
                                  const updated = [...formData.facilities];
                                  updated[idx].category = e.target.value;
                                  setFormData({ ...formData, facilities: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-white border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={fac.name}
                                onChange={(e) => {
                                  const updated = [...formData.facilities];
                                  updated[idx].name = e.target.value;
                                  setFormData({ ...formData, facilities: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-white border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={fac.icon}
                                onChange={(e) => {
                                  const updated = [...formData.facilities];
                                  updated[idx].icon = e.target.value;
                                  setFormData({ ...formData, facilities: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-amber-300 border-none focus:bg-neutral-800 focus:outline-none rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <input
                                type="text"
                                value={fac.description}
                                onChange={(e) => {
                                  const updated = [...formData.facilities];
                                  updated[idx].description = e.target.value;
                                  setFormData({ ...formData, facilities: updated });
                                }}
                                className="w-full bg-transparent px-2 py-1 text-neutral-300 border-none focus:bg-neutral-800 focus:outline-none font-sans rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SPREADSHEET TABLE: BOOKINGS */}
              {spreadsheetSubTab === 'bookings' && (
                <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-amber-300">
                      Tabel: log_reservasi_masuk ({formData.bookings.length} pemesanan)
                    </span>
                    <button
                      onClick={() => exportToCSV('bookings')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unduh Laporan CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[500px] spreadsheet-scroll">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[11px] sticky top-0 border-b border-neutral-800 z-10">
                        <tr>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[90px]">ID</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[140px]">Nama Tamu</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[130px]">No. WhatsApp</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[180px]">Kamar</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[100px]">Check-In</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[100px]">Check-Out</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[70px]">Malam</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[130px]">Total Biaya</th>
                          <th className="p-2.5 border-r border-neutral-800 min-w-[150px]">Status Reservasi</th>
                          <th className="p-2.5 min-w-[110px] text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 font-mono">
                        {formData.bookings.map((booking, bIdx) => (
                          <tr key={booking.id} className="hover:bg-neutral-800/60 transition-colors">
                            <td className="p-2.5 border-r border-neutral-800 text-amber-400 font-semibold">
                              {booking.id}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-white font-sans font-medium">
                              {booking.guestName}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-neutral-300">
                              {booking.guestPhone}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-neutral-300 font-sans truncate max-w-[200px]">
                              {booking.roomName}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-neutral-300">
                              {booking.checkIn}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-neutral-300">
                              {booking.checkOut}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-center text-neutral-300">
                              {booking.nights}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-amber-300 font-bold tabular-nums">
                              {formatIDR(booking.totalPrice)}
                            </td>
                            <td className="p-1 border-r border-neutral-800">
                              <select
                                value={booking.status}
                                onChange={(e) => {
                                  const updated = [...formData.bookings];
                                  updated[bIdx].status = e.target.value as any;
                                  setFormData({ ...formData, bookings: updated });
                                  setSaveStatus(`Status ${booking.id} diubah ke "${e.target.value}". Klik Simpan Perubahan.`);
                                }}
                                className={`w-full bg-neutral-900 text-xs rounded px-2 py-1 font-sans border ${
                                  booking.status === 'Terkonfirmasi'
                                    ? 'text-emerald-300 border-emerald-600/50'
                                    : booking.status === 'Dibatalkan'
                                    ? 'text-red-400 border-red-700/50'
                                    : 'text-amber-300 border-amber-600/50'
                                }`}
                              >
                                <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                <option value="Terkonfirmasi">Terkonfirmasi</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Dibatalkan">Dibatalkan (Buka Tanggal)</option>
                              </select>
                            </td>
                            <td className="p-2 text-center flex items-center justify-center gap-1.5">
                              <a
                                href={`https://api.whatsapp.com/send?phone=${booking.guestPhone.replace(/\D/g, '')}&text=${encodeURIComponent(
                                  `Halo Kak ${booking.guestName}, kami dari ${formData.villaConfig.brandName} mengonfirmasi pesanan ${booking.id} Anda.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-sans transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WA</span>
                              </a>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="p-1.5 text-red-400 hover:text-red-200 hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                                title="Hapus Data Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Daftar Reservasi Masuk</h3>
                  <p className="text-xs text-neutral-400">
                    Setiap pemesanan dari formulir WhatsApp otomatis tercatat di database spreadsheet ini.
                  </p>
                </div>
                <button
                  onClick={() => exportToCSV('bookings')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Ekspor ke CSV / Excel</span>
                </button>
              </div>

              {formData.bookings.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  Belum ada pesanan masuk. Pesanan tamu akan otomatis muncul di sini.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-neutral-800/80 rounded-xl border border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {b.id}
                          </span>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <span className="text-sm font-bold text-white">{b.guestName}</span>
                          <span className="text-xs text-neutral-400">({b.guestPhone})</span>
                        </div>
                        <p className="text-xs text-neutral-300">
                          {b.roomName} · {b.checkIn} s/d {b.checkOut} ({b.nights} Malam, {b.guests} Tamu)
                        </p>
                        {b.notes && (
                          <p className="text-[11px] text-amber-200/80 italic">Catatan: "{b.notes}"</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-amber-300 block">
                            {formatIDR(b.totalPrice)}
                          </span>
                        </div>

                        {/* Status selector with live auto-save */}
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                          className={`text-[11px] rounded px-2.5 py-1.5 font-medium border bg-neutral-900 cursor-pointer ${
                            b.status === 'Terkonfirmasi'
                              ? 'text-emerald-300 border-emerald-600/50'
                              : b.status === 'Dibatalkan'
                              ? 'text-red-400 border-red-700/50'
                              : 'text-amber-300 border-amber-600/50'
                          }`}
                        >
                          <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                          <option value="Terkonfirmasi">Terkonfirmasi (Blokir Tanggal)</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan (Buka Tanggal)</option>
                        </select>

                        <a
                          href={`https://api.whatsapp.com/send?phone=${b.guestPhone.replace(/\D/g, '')}&text=${encodeURIComponent(
                            `Halo Kak ${b.guestName}, kami dari ${formData.villaConfig.brandName} mengonfirmasi pesanan ${b.id} Anda.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat WA</span>
                        </a>

                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-2 text-red-400 hover:text-red-200 hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                          title="Hapus Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
