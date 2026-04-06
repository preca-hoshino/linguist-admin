/**
 * 压缩图片，并返回 Base64 字符串。
 * 只有当文件超过指定大小时，才会进行 Canvas 压缩。
 *
 * @param file 原始图片文件
 * @param thresholdBytes 触发压缩的体积阈值（默认 512KB）
 * @param maxWidth 压缩后的最大宽度（默认 800px）
 * @param quality JPEG 压缩质量 (0-1)
 * @returns 压缩后（或未压缩）的 Base64 数据
 */
export async function compressImage(
  file: File,
  thresholdBytes = 512 * 1024,
  maxWidth = 800,
  quality = 0.8,
): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('loadend', (): void => {
      const base64Data = reader.result as string;

      // 若未超过阈值，直接返回原图 Base64，不进行劣化
      if (file.size <= thresholdBytes) {
        resolve(base64Data);
        return;
      }

      // 超过阈值，开始 Canvas 压缩
      const img = new Image();
      img.addEventListener('load', () => {
        let { width, height } = img;

        // 等比缩放
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 导出压缩后的 JPEG Base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      });

      img.addEventListener('error', (): void => {
        reject(new Error('Failed to load image for compression'));
      });
      img.src = base64Data;
    });

    reader.addEventListener('error', (): void => {
      reject(new Error('Failed to read file'));
    });
    reader.readAsDataURL(file);
  });
}
