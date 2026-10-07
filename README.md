# Anthropic Presence

A free Windows companion that shows the exact Anthropic model you’re using (Claude Opus 5.5, Claude Fable 5.1, …), the project folder you’re working in, an original warm bloom artwork, and an elapsed timer on your Discord profile. It's the sibling of [OpenAI Presence](https://github.com/findastra/openai-discord-presence) and runs beside it: OpenAI Presence uses port 38761, Anthropic Presence uses 38762, and each has its own Discord application, so both activities can show at once.

## Use it

1. Install [Node.js 24 or later](https://nodejs.org/en/download) if needed. (The launcher also finds the Node that ships with Codex.)
2. Double-click **Start Anthropic Presence.cmd**. Your browser opens the local controls at `http://127.0.0.1:38762/`.
3. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application with any name (Discord blocks some brand names). The card's bold title always reads **Anthropic**: the app sends it with each update, in place of the application name.
4. Under **Rich Presence → Art Assets**, upload `public/claude-bloom.png` named **claude_bloom**. Copy the Application ID from General Information.
5. In the local app, expand **Connect to Discord**, paste the Application ID, and save.
6. Keep Discord desktop open with activity sharing on, then choose **Start session** or **Automatic**.
7. Optional: double-click **Enable Automatic Startup.cmd** once to start it quietly at Windows sign-in.

## Modes

- **Manual:** timer runs until Stop sharing or Quit app.
- **Automatic:** shares while the Claude desktop app (`claude.exe`) is running, or while a Claude Code transcript under `~/.claude/projects` was written in the last 5 minutes.
- **Off:** disconnects immediately.

The card names the exact model, for example **Using Claude Opus 5.5**, and hovering the bloom shows the raw id (`claude-opus-5-5`). The model comes from the newest Claude Code transcript. The desktop chat doesn't record its model locally, so it shows plain **Using Claude**. Switching models keeps the timer running.

## Project sharing

Turn on **Show my project on Discord** and the card reads **Working on [project]**, where the project is the name of the folder your newest Claude Code session works in (for example `paper-girl`), never the chat title or the full path. Sessions with no folder (the desktop app's scratch workspace) show **Exploring ideas**. A fixed Project name in the settings overrides the folder name.

## Privacy

Binds to `127.0.0.1` only, checks exact Host/Origin on changes, no telemetry. The Application ID, image key and optional project name live in `.local/config.json` (git-ignored). To find the model and project, the app scans only the last 64 KB of the newest transcript for its `"model"` and `"cwd"` values and keeps only the model id and the folder's last name; all other text is discarded, never stored or sent. The Discord payload contains the model name, the start timestamp, the image key and, if you opt in, your project name.

## Development

```sh
node --test
node src/server.js
```

## Credits

Built by Astra from the MIT-licensed OpenAI Presence. The bloom artwork is original. This independent companion isn't affiliated with Anthropic; "Claude" is Anthropic's trademark.
