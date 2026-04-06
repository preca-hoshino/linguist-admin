import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compressImage } from '../compress-image';

const createMockFile = (size: number): File => {
  const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

class MockFileReader {
  public result = 'data:image/jpeg;base64,original';
  public listeners: Record<string, () => void> = {};
  public shouldFail = false;
  public addEventListener(event: string, callback: () => void): void {
    this.listeners[event] = callback;
  }
  public readAsDataURL(): void {
    setTimeout(() => {
      if (this.shouldFail && this.listeners.error) {
        this.listeners.error();
      } else if (!this.shouldFail && this.listeners.loadend) {
        this.listeners.loadend();
      }
    }, 0);
  }
}

class MockImage {
  public width = 1600;
  public height = 1000;
  public shouldFail = false;
  public listeners: Record<string, () => void> = {};
  public addEventListener(event: string, callback: () => void): void {
    this.listeners[event] = callback;
  }
  public set src(_val: string) {
    setTimeout(() => {
      if (this.shouldFail && this.listeners.error) {
        this.listeners.error();
      } else if (!this.shouldFail && this.listeners.load) {
        this.listeners.load();
      }
    }, 0);
  }
}

describe('compressImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should resolve with original base64 if file size is under threshold', async () => {
    const file = createMockFile(500); // 500 < 1000

    vi.stubGlobal('FileReader', MockFileReader);

    const result = await compressImage(file, 1000, 800, 0.8);
    expect(result).toBe('data:image/jpeg;base64,original');
  });

  it('should reject if FileReader fails', async () => {
    const file = createMockFile(500);

    const FailingReader = class extends MockFileReader {
      public constructor() {
        super();
        this.shouldFail = true;
      }
    };
    vi.stubGlobal('FileReader', FailingReader);

    await expect(compressImage(file)).rejects.toThrow('Failed to read file');
  });

  it('should compress image and resolve base64 if file size is over threshold', async () => {
    const file = createMockFile(2000); // 2000 > 1000

    const LargeReader = class extends MockFileReader {
      public override result = 'data:image/jpeg;base64,large';
    };
    vi.stubGlobal('FileReader', LargeReader);

    vi.stubGlobal('Image', MockImage);

    const mockContext = { drawImage: vi.fn() };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,compressed'),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return mockCanvas as never;
      }
      return document.createElement(tag);
    });

    const result = await compressImage(file, 1000, 800, 0.8);
    expect(result).toBe('data:image/jpeg;base64,compressed');
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(500); // (1000 * 800) / 1600
    expect(mockContext.drawImage).toHaveBeenCalled();
  });

  it('should not scale down if image width is smaller than max width', async () => {
    const file = createMockFile(2000); // 2000 > 1000

    const LargeReader = class extends MockFileReader {
      public override result = 'data:image/jpeg;base64,large';
    };
    vi.stubGlobal('FileReader', LargeReader);

    const SmallImage = class extends MockImage {
      public override width = 400;
      public override height = 300;
    };
    vi.stubGlobal('Image', SmallImage);

    const mockContext = { drawImage: vi.fn() };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,compressed'),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return mockCanvas as never;
      }
      return document.createElement(tag);
    });

    await compressImage(file, 1000, 800, 0.8);
    expect(mockCanvas.width).toBe(400);
    expect(mockCanvas.height).toBe(300);
  });

  it('should reject if Image fails to load', async () => {
    const file = createMockFile(2000);

    const LargeReader = class extends MockFileReader {
      public override result = 'data:image/jpeg;base64,large';
    };
    vi.stubGlobal('FileReader', LargeReader);

    const FailingImage = class extends MockImage {
      public constructor() {
        super();
        this.shouldFail = true;
      }
    };
    vi.stubGlobal('Image', FailingImage);

    await expect(compressImage(file, 1000)).rejects.toThrow('Failed to load image for compression');
  });

  it('should reject if canvas context is not available', async () => {
    const file = createMockFile(2000);

    const LargeReader = class extends MockFileReader {
      public override result = 'data:image/jpeg;base64,large';
    };
    vi.stubGlobal('FileReader', LargeReader);

    const StandardImage = class extends MockImage {
      public override width = 800;
      public override height = 600;
    };
    vi.stubGlobal('Image', StandardImage);

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => null), // Returns null context
      toDataURL: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return mockCanvas as never;
      }
      return document.createElement(tag);
    });

    await expect(compressImage(file, 1000)).rejects.toThrow('Failed to get canvas context');
  });
});
