/**
 * Sensor Data Packet Structure (7 Bytes)
 *
 * | Offset | Length | Field       | Type      | Description      |
 * |--------|--------|-------------|-----------|------------------|
 * |   0    |   4    | Temperature | Float32   | Temperature in °C|
 * |   4    |   2    | Humidity    | Int16     | Humidity in %    |
 * |   6    |   1    | Status      | Uint8     | Status Code      |
 *
 * ASCII Representation:
 *  ---------------------------------------------------
 * |  T(4 bytes)  |  H(2 bytes)  |  S(1 byte)  |
 *  ---------------------------------------------------
 */

class SensorDataPacket {
  private buffer: ArrayBuffer;
  private view: DataView;

  constructor(buffer: ArrayBuffer) {
    if (buffer.byteLength !== 7) {
      throw new Error("Invalid packet size. Expected 7 bytes.");
    }
    this.buffer = buffer;
    this.view = new DataView(buffer);
  }

  public getTemperature(): number {
    return this.view.getFloat32(0, true);
  }
  public getHumidity(): number {
    return this.view.getInt16(4, true);
  }
  public getStatus(): string {
    const statusCode = this.view.getUint8(6);
    return statusCode === 1 ? "OK" : "ERROR";
  }

  public parse(): { temperature: number; humidity: number; status: string } {
    return {
      temperature: this.getTemperature(),
      humidity: this.getHumidity(),
      status: this.getStatus(),
    };
  }
}

function simulateSensorData(): ArrayBuffer {
  const buffer = new ArrayBuffer(7);
  const view = new DataView(buffer);

  view.setFloat32(0, 36.5, true);
  view.setInt16(4, 80, true);
  view.setUint8(6, 1);

  return buffer;
}

function main() {
  const sensorPacket = simulateSensorData();

  const sensorData = new SensorDataPacket(sensorPacket);
  const parsedData = sensorData.parse();

  console.log("=== Decoded Sensor Data ===");
  console.log(`Temperature: ${parsedData.temperature.toFixed(2)} °C`);
  console.log(`Humidity: ${parsedData.humidity} %`);
  console.log(`Status: ${parsedData.status}`);
}
main();
