/**
 * Utilitário para redimensionar e comprimir imagens antes de salvar no localStorage
 * Garante que fotos da câmera e uploads não estourem a cota de 5MB do navegador.
 */
export async function compressImage(
  source: string | File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = () => {
      let { width, height } = img;

      // Mantém proporção limitando largura e altura máximas
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback para string original se canvas não estiver disponível
        resolve(typeof source === 'string' ? source : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Converte para JPEG ultra comprimido (~15KB a 35KB)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      console.warn('Erro ao processar imagem para compressão.');
      resolve(typeof source === 'string' ? source : '');
    };

    img.onload = () => {
      processImage();
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(source);
    }
  });
}
