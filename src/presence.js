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

const cap = word => word.charAt(0).toUpperCase() + word.slice(1);

// Friendly name for an exact model id: 'claude-opus-5-5' → 'Claude Opus 5.5', 'claude-haiku-4-5-20251001' → 'Claude Haiku 4.5'.
// Unrecognized ids are shown exactly as written. Empty means the model is unknown.
export function modelLabel(id) {
  const model = projectLabel(id).slice(0, 64);
  const named = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?(\[1m\])?$/i.exec(model);
  if (named) return `Claude ${cap(named[1])} ${named[2]}${named[3] ? '.' + named[3] : ''}${named[4] ? ' (1M)' : ''}`;
  const legacy = /^claude-(\d+)(?:-(\d))?-([a-z]+)(?:-\d{8})?$/i.exec(model);
  if (legacy) return `Claude ${legacy[1]}${legacy[2] ? '.' + legacy[2] : ''} ${cap(legacy[3])}`;
  return model;
}

const EFFORTS = { minimal: 'Minimal', low: 'Low', medium: 'Medium', high: 'High', xhigh: 'Extra High', max: 'Max', ultra: 'Ultra' };

// Friendly name for an effort level: 'high' → 'High', 'xhigh' → 'Extra High'. Unknown levels are capitalized; empty means unknown.
export function effortLabel(id) {
  const effort = String(id ?? '').trim().toLowerCase();
  if (!/^[a-z-]{1,20}$/.test(effort)) return '';
  return EFFORTS[effort] ?? cap(effort);
}

export function activity(startedAt, image = 'claude_bloom', project = '', model = '', effort = '') {
  if (startedAt === null) return null;
  const name = modelLabel(model) || 'Claude';
  // The effort level only means something next to a known model.
  const level = modelLabel(model) ? effortLabel(effort) : '';
  return {
    type: 0,
    // Card title. Discord shows this instead of the registered app name, which can't be a brand name.
    name: 'Anthropic',
    details: level ? `Using ${name} on ${level}` : `Using ${name}`,
    state: projectLabel(project) ? `Working on ${projectLabel(project)}` : 'Exploring ideas',
    timestamps: { start: startedAt },
    assets: { large_image: image, large_text: projectLabel(model).slice(0, 64) || name },
  };
}

export function validateConfig(input) {
  const clientId = String(input.clientId ?? '').trim();
  const image = String(input.image ?? 'claude_bloom').trim();
  if (!/^\d{17,20}$/.test(clientId)) throw new Error('Paste the 17–20 digit Discord Application ID. No token needed.');
  if (!/^[a-z0-9_-]{1,128}$/.test(image)) throw new Error('Use an uploaded asset key, such as claude_bloom.');
  return { clientId, image, shareProject: input.shareProject === true, projectName: projectLabel(input.projectName), automaticOnStart: input.automaticOnStart === true };
}
