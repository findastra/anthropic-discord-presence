import { setStartup } from '../src/windows-startup.js';
const enabled = !process.argv.includes('--remove');
setStartup(enabled);
console.log(enabled
  ? 'Anthropic Presence will start quietly in Automatic mode at Windows sign-in. Keep this app folder in place.'
  : 'Anthropic Presence will no longer launch at Windows sign-in.');
