const path = require('path');
const sharp = require('sharp');

const root = 'C:\\AI-Workspace\\Qobban\\MARKETING\\week-1-qobban-v2\\post-07-checklist-carousel';
const finals = path.join(root, 'finals-4x5-v2');
const files = [
  'slide-01-cover-v2.png',
  'slide-02-material-v2.png',
  'slide-03-climate-v2.png',
  'slide-04-measurement-v2.png',
  'slide-05-scope-v2.png',
  'slide-06-after-fabrication-v2.png',
  'slide-07-cta-v2.png',
];

async function main() {
  const thumbW = 270;
  const thumbH = 338;
  const gap = 22;
  const margin = 28;
  const width = margin * 2 + thumbW * 4 + gap * 3;
  const height = margin * 2 + thumbH * 2 + gap;
  const secondRowOffset = Math.round((width - (thumbW * 3 + gap * 2)) / 2);
  const composites = [];

  for (let index = 0; index < files.length; index += 1) {
    const buffer = await sharp(path.join(finals, files[index]))
      .resize(thumbW, thumbH, { fit: 'cover' })
      .png()
      .toBuffer();
    const row = index < 4 ? 0 : 1;
    const col = index < 4 ? index : index - 4;
    const left = row === 0 ? margin + col * (thumbW + gap) : secondRowOffset + col * (thumbW + gap);
    const top = margin + row * (thumbH + gap);
    composites.push({ input: buffer, left, top });
  }

  await sharp({ create: { width, height, channels: 3, background: '#111111' } })
    .composite(composites)
    .png()
    .toFile(path.join(root, 'price-carousel-v3-contact-sheet.png'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
