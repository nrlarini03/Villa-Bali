/**
 * Helper to upload an image from file input to server or return base64
 */
export async function uploadImageFile(file: File, label: string = 'foto_villa'): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Read file as Data URL
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        return reject(new Error('Gambar kosong'));
      }

      // 2. Client-side image resize / optimization using Canvas
      const img = new Image();
      img.onerror = () => reject(new Error('Format file bukan gambar yang valid'));
      img.onload = async () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl); // fallback to raw
        }
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        // 3. Try uploading to server API
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: optimizedBase64,
              filename: `${label}_${file.name.replace(/\.[^/.]+$/, '')}`,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              return resolve(data.url);
            }
          }
        } catch {
          // If server fails or in static mode, optimized base64 is used
        }

        // Fallback: return the optimized data URL directly
        resolve(optimizedBase64);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
