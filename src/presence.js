export const IDLE_MS = 5 * 60 * 1000;

export class Presence {
  mode = 'off';
  startedAt = null;
  setMode(mode) {
    if (!['off', 'auto', 'manual'].includes(mode)) throw new Error('Choose Off, Automatic, or Manual.');
    if (mode !== this.mode) this.startedAt = null;
    this.mode = mode;
  }
  update(detected, now = Date.now()) {
    const active = this.mode === 'manual' || (this.mode === 'auto' && detected);
    if (!active) this.startedAt = null;
    else this.startedAt ??= Math.floor(now / 1000);
    return this.startedAt;
  }
}

export function projectLabel(value) {
  return String(value ?? '').replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 110);
}

export function activity(startedAt, image = 'claude_bloom', project = '') {
  if (startedAt === null) return null;
  return {
    type: 0,
    details: 'Using Claude',
    state: projectLabel(project) ? `Working on ${projectLabel(project)}` : 'Exploring ideas',
    timestamps: { start: startedAt },
    assets: { large_image: image, large_text: 'Claude' },
  };
}

export function validateConfig(input) {
  const clientId = String(input.clientId ?? '').trim();
  const image = String(input.image ?? 'claude_bloom').trim();
  if (!/^\d{17,20}$/.test(clientId)) throw new Error('Paste the 17–20 digit Discord Application ID. No token needed.');
  if (!/^[a-z0-9_-]{1,128}$/.test(image)) throw new Error('Use an uploaded asset key, such as claude_bloom.');
  return { clientId, image, shareProject: input.shareProject === true, projectName: projectLabel(input.projectName), automaticOnStart: input.automaticOnStart === true };
}
