import { copyFile, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const buildDir = resolve(root, 'dist')
const staticDir = resolve(buildDir, 'static')
const serverDir = resolve(root, 'dist', 'server')
const metadataDir = resolve(root, 'dist', '.openai')

await mkdir(staticDir, { recursive: true })
for (const entry of await readdir(buildDir)) {
  if (entry !== 'static') {
    await rename(resolve(buildDir, entry), resolve(staticDir, entry))
  }
}
await mkdir(serverDir, { recursive: true })
await mkdir(metadataDir, { recursive: true })
await copyFile(resolve(root, '.openai', 'hosting.json'), resolve(metadataDir, 'hosting.json'))

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
}

const files = {}
const collect = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      await collect(fullPath)
      continue
    }
    const pathname = `/${relative(staticDir, fullPath).split(sep).join('/')}`
    const extension = extname(entry.name)
    const buffer = await readFile(fullPath)
    files[pathname] = {
      body: extension === '.png' ? buffer.toString('base64') : buffer.toString('utf8'),
      binary: extension === '.png',
      type: contentTypes[extension] || 'application/octet-stream',
    }
  }
}
await collect(staticDir)

await writeFile(
  resolve(serverDir, 'index.js'),
  `const files = ${JSON.stringify(files)}
const decode = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0))

export default {
  async fetch(request) {
    const pathname = new URL(request.url).pathname
    const file = files[pathname] || (pathname.includes('.') ? null : files['/index.html'])
    if (!file) return new Response('Not found', { status: 404 })
    return new Response(file.binary ? decode(file.body) : file.body, {
      headers: {
        'Content-Type': file.type,
        'Cache-Control': pathname === '/' || pathname === '/index.html'
          ? 'no-cache'
          : 'public, max-age=31536000, immutable',
      },
    })
  }
}
`,
)
