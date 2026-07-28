import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const viteCli = path.join(projectDirectory, 'node_modules', 'vite', 'bin', 'vite.js')
const playwrightCli = path.join(projectDirectory, 'node_modules', '@playwright', 'test', 'cli.js')
const forwardedArguments = process.argv.slice(2)

const preview = spawn(process.execPath, [viteCli, '--host', '127.0.0.1', '--port', '5173'], {
  cwd: projectDirectory,
  stdio: 'ignore',
  windowsHide: true,
})

const stopPreview = () => {
  if (!preview.pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
  } else {
    preview.kill('SIGTERM')
  }
}

const waitForPreview = async () => {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch('http://127.0.0.1:5173')
      if (response.ok) return
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error('The local preview did not start within 30 seconds.')
}

let exitCode = 1
try {
  await waitForPreview()
  exitCode = await new Promise((resolve, reject) => {
    const tests = spawn(process.execPath, [playwrightCli, 'test', ...forwardedArguments], {
      cwd: projectDirectory,
      stdio: 'inherit',
      windowsHide: true,
    })
    tests.once('error', reject)
    tests.once('exit', (code) => resolve(code ?? 1))
  })
} finally {
  stopPreview()
}

process.exit(exitCode)
