import { $ } from 'bun'

await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
  target: 'bun',
  minify: true
})
await $`chmod +x dist/index.js`
