// Draws the Riselyo icon (a white sun rising over the horizon on brand blue) without any
// image dependency: shapes are rasterised with 4x4 supersampling and encoded as PNG with zlib.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const PUBLIC_DIR = new URL('../public/', import.meta.url);
const BRAND_BLUE = [37, 99, 184];
const WHITE = [255, 255, 255];
const SUPERSAMPLING = 4;
const MASKABLE_SAFE_ZONE = 0.8;

const SUN = { cx: 0.5, cy: 0.6, radius: 0.24 };
const HORIZON = { top: 0.64, bottom: 0.69, left: 0.2, right: 0.8 };
const RAYS = [-60, -30, 0, 30, 60].map((deg) => (deg * Math.PI) / 180);
const RAY = { from: 0.3, to: 0.38, halfWidth: 0.022 };

function isInsideMotif(x, y) {
  const dx = x - SUN.cx;
  const dy = y - SUN.cy;
  const inSun = dy <= 0 && Math.hypot(dx, dy) <= SUN.radius;
  const inHorizon =
    y >= HORIZON.top && y <= HORIZON.bottom && x >= HORIZON.left && x <= HORIZON.right;
  return inSun || inHorizon || RAYS.some((angle) => isInsideRay(dx, dy, angle));
}

function isInsideRay(dx, dy, angle) {
  const along = dx * Math.sin(angle) - dy * Math.cos(angle);
  const across = dx * Math.cos(angle) + dy * Math.sin(angle);
  return along >= RAY.from && along <= RAY.to && Math.abs(across) <= RAY.halfWidth;
}

function coverage(px, py, { size, scale }) {
  let hits = 0;
  for (let sy = 0; sy < SUPERSAMPLING; sy += 1) {
    for (let sx = 0; sx < SUPERSAMPLING; sx += 1) {
      const x = (px + (sx + 0.5) / SUPERSAMPLING) / size;
      const y = (py + (sy + 0.5) / SUPERSAMPLING) / size;
      if (isInsideMotif(0.5 + (x - 0.5) / scale, 0.5 + (y - 0.5) / scale)) hits += 1;
    }
  }
  return hits / SUPERSAMPLING ** 2;
}

function renderPixels(size, scale) {
  const rowLength = size * 4 + 1;
  const raw = Buffer.alloc(rowLength * size);
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const alpha = coverage(px, py, { size, scale });
      const offset = py * rowLength + 1 + px * 4;
      for (let c = 0; c < 3; c += 1) {
        raw[offset + c] = Math.round(BRAND_BLUE[c] * (1 - alpha) + WHITE[c] * alpha);
      }
      raw[offset + 3] = 255;
    }
  }
  return raw;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, scale) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(renderPixels(size, scale), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const ICONS = [
  { file: 'icon-192.png', size: 192, scale: 1 },
  { file: 'icon-512.png', size: 512, scale: 1 },
  { file: 'icon-maskable-512.png', size: 512, scale: MASKABLE_SAFE_ZONE },
  { file: 'apple-touch-icon.png', size: 180, scale: 1 },
];

for (const { file, size, scale } of ICONS) {
  writeFileSync(new URL(file, PUBLIC_DIR), encodePng(size, scale));
}
