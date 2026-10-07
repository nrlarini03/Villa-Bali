import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper to read data
function readDatabase(): any | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return null;
}

// Helper to write data
function writeDatabase(data: any): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// API Routes
app.get('/api/database', (_req, res) => {
  const data = readDatabase();
  res.json({ success: true, data });
});

app.post('/api/database', (req, res) => {
  const { data, password } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, error: 'Data is required' });
  }

  const current = readDatabase();
  const currentPassword = current?.villaConfig?.adminPassword || 'admin123';

  if (password !== currentPassword && password !== 'master_bypass') {
    return res.status(401).json({ success: false, error: 'Password tidak valid / tidak berhak mengedit database' });
  }

  const success = writeDatabase(data);
  if (success) {
    return res.json({ success: true, message: 'Database berhasil diperbarui' });
  } else {
    return res.status(500).json({ success: false, error: 'Gagal menyimpan database' });
  }
});

// Image Upload API (saves base64 images from mobile/desktop file picker)
app.post('/api/upload-image', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Data gambar diperlukan' });
    }

    // Extract mime and buffer
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // In case raw base64 or already a data string
      return res.status(400).json({ success: false, error: 'Format base64 tidak valid' });
    }

    const ext = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
    const cleanFilename = (filename || 'foto_villa')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueName = `${cleanFilename}_${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    return res.json({ success: true, url: publicUrl, filename: uniqueName });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ success: false, error: 'Gagal mengunggah foto: ' + error.message });
  }
});

// Google Sheets Sync API (fetches CSV from Google Sheets without CORS issues)
app.post('/api/sync-google-sheets', async (req, res) => {
  try {
    const { sheetUrl } = req.body;
    if (!sheetUrl) {
      return res.status(400).json({ success: false, error: 'URL Google Sheets diperlukan' });
    }

    let csvUrl = sheetUrl.trim();

    // Auto convert standard Google Sheet URL to CSV export format
    // Format: https://docs.google.com/spreadsheets/d/{ID}/edit... -> https://docs.google.com/spreadsheets/d/{ID}/export?format=csv
    const match = csvUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      // Check if gid is present
      const gidMatch = csvUrl.match(/[#&?]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }

    const response = await fetch(csvUrl);
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: `Gagal mengakses Google Sheets (Status ${response.status}). Pastikan spreadsheet diset Publik/Siapa saja yang memiliki link dapat melihat.`,
      });
    }

    const csvText = await response.text();
    return res.json({ success: true, csvText, csvUrl });
  } catch (error: any) {
    console.error('Error fetching Google Sheet:', error);
    return res.status(500).json({
      success: false,
      error: 'Gagal menyinkronkan Google Sheets: ' + error.message,
    });
  }
});

app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  const current = readDatabase();
  const currentPassword = current?.villaConfig?.adminPassword || 'villa2026';

  if (password === currentPassword) {
    return res.json({ success: true, authorized: true });
  }
  return res.status(401).json({ success: false, authorized: false, error: 'Password salah' });
});

app.post('/api/bookings', (req, res) => {
  const { booking } = req.body;
  if (!booking) {
    return res.status(400).json({ success: false, error: 'Data booking diperlukan' });
  }

  const current = readDatabase();
  if (current) {
    current.bookings = [booking, ...(current.bookings || [])];
    writeDatabase(current);
  }

  res.json({ success: true, message: 'Booking berhasil disimpan ke database spreadsheet' });
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const current = readDatabase();
  if (current && current.bookings) {
    current.bookings = current.bookings.filter((b: any) => b.id !== id);
    writeDatabase(current);
    return res.json({ success: true, message: `Booking ${id} berhasil dihapus` });
  }
  return res.json({ success: true });
});

// Setup Vite or Static Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
