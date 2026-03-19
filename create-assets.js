const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const dir = path.join(__dirname, 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

function createPNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((1 + width * 3) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      raw[y * (width * 3 + 1) + 1 + x * 3] = r;
      raw[y * (width * 3 + 1) + 2 + x * 3] = g;
      raw[y * (width * 3 + 1) + 3 + x * 3] = b;
    }
  }
  const idat = zlib.deflateSync(raw);
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const tb = Buffer.from(type);
    let c = 0xFFFFFFFF;
    for (const byte of Buffer.concat([tb, data])) { c ^= byte; for (let i = 0; i < 8; i++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
    const crcOut = Buffer.alloc(4); crcOut.writeUInt32BE((c ^ 0xFFFFFFFF) >>> 0);
    return Buffer.concat([len, tb, data, crcOut]);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync(path.join(dir, 'icon.png'), createPNG(1024, 1024, 108, 99, 255));
fs.writeFileSync(path.join(dir, 'adaptive-icon.png'), createPNG(1024, 1024, 108, 99, 255));
fs.writeFileSync(path.join(dir, 'splash.png'), createPNG(1284, 2778, 26, 26, 46));
fs.writeFileSync(path.join(dir, 'favicon.png'), createPNG(48, 48, 108, 99, 255));
fs.writeFileSync(path.join(dir, 'notification-icon.png'), createPNG(96, 96, 255, 255, 255));
console.log('assets created:', fs.readdirSync(dir));
