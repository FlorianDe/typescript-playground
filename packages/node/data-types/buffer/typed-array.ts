/**
 * Image Data Manipulation Example
 *
 * - Simulates a 2x2 image with RGBA pixel data.
 * - Converts the image to grayscale by averaging the RGB values.
 * - Uses Uint8ClampedArray for efficient memory handling.
 */

class ImageProcessor {
  private width: number;
  private height: number;
  private pixelData: Uint8ClampedArray;

  constructor(width: number, height: number, pixelData: Uint8ClampedArray) {
    if (pixelData.length !== width * height * 4) {
      throw new Error("Invalid pixel data size for given dimensions.");
    }

    this.width = width;
    this.height = height;
    this.pixelData = pixelData;
  }

  public toGrayscale(): ImageProcessor {
    const newPixelData = new Uint8ClampedArray(this.pixelData); // Copy original data
    for (let i = 0; i < newPixelData.length; i += 4) {
      const r = newPixelData[i];
      const g = newPixelData[i + 1];
      const b = newPixelData[i + 2];
      const gray = Math.round((r + g + b) / 3);
      newPixelData[i] = gray;
      newPixelData[i + 1] = gray;
      newPixelData[i + 2] = gray;
    }
    return new ImageProcessor(this.width, this.height, newPixelData);
  }

  public getPixelData(): string {
    let output = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = (y * this.width + x) * 4;
        const r = this.pixelData[index];
        const g = this.pixelData[index + 1];
        const b = this.pixelData[index + 2];
        const a = this.pixelData[index + 3];
        output += `(${r},${g},${b},${a}) `;
      }
      output += "\n";
    }
    return output;
  }
}

function simulateImageData(): Uint8ClampedArray {
  // 2x2 Image => 4 pixels => 4 * 4 = 16 bytes
  return new Uint8ClampedArray([
    255,
    0,
    0,
    255, // Red pixel (255,0,0,255)
    0,
    255,
    0,
    255, // Green pixel (0,255,0,255)
    0,
    0,
    255,
    255, // Blue pixel (0,0,255,255)
    255,
    255,
    0,
    255, // Yellow pixel (255,255,0,255)
  ]);
}

function main() {
  const width = 2;
  const height = 2;
  const pixelData = simulateImageData();
  console.log("Original Pixel Data:");
  console.log(new ImageProcessor(width, height, pixelData).getPixelData());

  const imageProcessor = new ImageProcessor(width, height, pixelData);
  imageProcessor.toGrayscale();

  console.log("Grayscale Pixel Data:");
  console.log(imageProcessor.getPixelData());
}
main();
