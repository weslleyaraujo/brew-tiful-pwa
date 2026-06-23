import sharp from 'sharp'
import { readFileSync } from 'fs'

const sizes = [
  { src: 'icon-192.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon-512.svg', out: 'icon-512.png', size: 512 },
  { src: 'apple-touch-icon.svg', out: 'apple-touch-icon.png', size: 180 },
  { src: 'favicon.svg', out: 'favicon.png', size: 48 },
]

for (const { src, out, size } of sizes) {
  let svg = readFileSync(`public/${src}`, 'utf-8')
  // Remove width/height so sharp uses viewBox, then add explicit dims via resize
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '')
  sharp(Buffer.from(svg), { density: 72 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`public/${out}`)
    .then(() => console.log(`  ✓ ${out}`))
    .catch(err => console.error(`  ✗ ${out}: ${err.message}`))
}
