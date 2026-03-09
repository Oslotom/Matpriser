import { GROCERY_CHAINS, STORE_LOGOS } from '../constants';

/**
 * Normalizes a store name to its corresponding chain name.
 */
export const normalizeStoreName = (name: string | null): string => {
  if (!name) return 'Ukjent butikk';
  const found = GROCERY_CHAINS.find(c => name.toLowerCase().includes(c.toLowerCase()));
  return found || name;
};

/**
 * Returns the logo URL for a given store name.
 */
export const getStoreLogo = (name: string | null): string | null => {
  if (!name) return null;
  const key = Object.keys(STORE_LOGOS).find(k => name.toLowerCase().includes(k.toLowerCase()));
  return key ? STORE_LOGOS[key] : null;
};

/**
 * Compresses an image file to reduce its size before uploading.
 */
export const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for better compression of photos
        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
