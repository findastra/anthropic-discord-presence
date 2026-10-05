import { execFile } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { IDLE_MS } from './presence.js';

// Newest modification time (ms) of Claude Code transcripts, or 0. Reads file metadata only, never contents.
export function latestClaudeCode(home = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')) {
  let latest = 0;
  try {
    const projects = join(home, 'projects');
    for (const dir of readdirSync(projects, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const file of readdirSync(join(projects, dir.name))) {
        if (!file.endsWith('.jsonl')) continue;
        try { latest = Math.max(latest, statSync(join(projects, dir.name, file)).mtimeMs); } catch { /* File rotated. */ }
      }
    }
  } catch { /* Claude Code not installed. */ }
  return latest;
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
    if (isRecent(latestClaudeCode(home), now)) return { active: true, message: 'Recent Claude Code activity detected.' };
    if (await desktop()) return { active: true, message: 'Claude desktop app is open.' };
    return { active: false, message: 'Waiting for the Claude app or Claude Code.' };
  } catch {
    return { active: false, message: 'Automatic detection unavailable. Manual mode still works.' };
  }
}
