import { execFile } from 'node:child_process';
import { readdirSync, statSync, openSync, fstatSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { IDLE_MS, modelLabel } from './presence.js';

// Newest Claude Code transcript as { file, mtimeMs }, or { file: '', mtimeMs: 0 }. Reads file metadata only.
export function latestClaudeCode(home = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')) {
  let latest = { file: '', mtimeMs: 0 };
  try {
    const projects = join(home, 'projects');
    for (const dir of readdirSync(projects, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const name of readdirSync(join(projects, dir.name))) {
        if (!name.endsWith('.jsonl')) continue;
        const file = join(projects, dir.name, name);
        try { const { mtimeMs } = statSync(file); if (mtimeMs > latest.mtimeMs) latest = { file, mtimeMs }; } catch { /* File rotated. */ }
      }
    }
  } catch { /* Claude Code not installed. */ }
  return latest;
}

// Exact model id of the latest reply, e.g. 'claude-opus-5-5', or ''. Scans only the last 64 KB of the
// transcript and keeps only the "model" value; conversation text is discarded, never stored or sent.
export function transcriptModel(file) {
  let fd;
  try {
    fd = openSync(file, 'r');
    const size = fstatSync(fd).size;
    const tail = Buffer.alloc(Math.min(size, 64 * 1024));
    readSync(fd, tail, 0, tail.length, size - tail.length);
    const ids = [...tail.toString('utf8').matchAll(/"model"\s*:\s*"(claude-[\w.\[\]-]{1,60})"/g)];
    return ids.at(-1)?.[1] ?? '';
  } catch { return ''; } finally { if (fd !== undefined) closeSync(fd); }
}

export function isRecent(mtimeMs, now = Date.now()) {
  const age = now - mtimeMs;
  return mtimeMs > 0 && age >= -5000 && age < IDLE_MS;
}

// True when the Claude desktop app is running (Windows only).
export function claudeDesktopRunning() {
  if (process.platform !== 'win32') return Promise.resolve(false);
  return new Promise(resolve => {
    execFile('tasklist', ['/FI', 'IMAGENAME eq claude.exe', '/FO', 'CSV', '/NH'], { windowsHide: true, timeout: 3000 },
      (error, stdout) => resolve(!error && /"claude\.exe"/i.test(stdout)));
  });
}

export async function detectClaude({ now = Date.now(), home, desktop = claudeDesktopRunning } = {}) {
  try {
    const latest = latestClaudeCode(home);
    if (isRecent(latest.mtimeMs, now)) {
      const model = transcriptModel(latest.file);
      return { active: true, model, message: `Recent ${modelLabel(model) || 'Claude Code'} activity detected.` };
    }
    // The desktop chat doesn't record its model locally, so this shows plain "Claude".
    if (await desktop()) return { active: true, model: '', message: 'Claude desktop app is open (model not visible to this app).' };
    return { active: false, model: '', message: 'Waiting for the Claude app or Claude Code.' };
  } catch {
    return { active: false, model: '', message: 'Automatic detection unavailable. Manual mode still works.' };
  }
}
