# Claude Presence

A free Windows companion that shows **Claude**, an original warm bloom artwork, and an elapsed timer on your Discord profile. It's the sibling of [Astra Presence](https://github.com/findastra/astra-discord-presence) and runs beside it: Astra uses port 38761, Claude uses 38762, and each has its own Discord application, so both activities can show at once.

## Use it

1. Install [Node.js 24 or later](https://nodejs.org/en/download) if needed. (The launcher also finds the Node that ships with Codex.)
2. Double-click **Start Claude Presence.cmd**. Your browser opens the local controls at `http://127.0.0.1:38762/`.
3. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application named **Claude**. The application name is the title Discord displays.
4. Under **Rich Presence → Art Assets**, upload `public/claude-bloom.png` named **claude_bloom**. Copy the Application ID from General Information.
5. In the local app, expand **Connect to Discord**, paste the Application ID, and save.
6. Keep Discord desktop open with activity sharing on, then choose **Start session** or **Automatic**.
7. Optional: double-click **Enable Automatic Startup.cmd** once to start it quietly at Windows sign-in.

## Modes

- **Manual:** timer runs until Stop sharing or Quit app.
- **Automatic:** shares while the Claude desktop app (`claude.exe`) is running, or while a Claude Code transcript under `~/.claude/projects` was written in the last 5 minutes. Only process names and file timestamps are read, never conversation contents.
- **Off:** disconnects immediately.

## Privacy

Binds to `127.0.0.1` only, checks exact Host/Origin on changes, no telemetry. The Application ID, image key and optional project name live in `.local/config.json` (git-ignored). The Discord payload contains fixed activity text, the start timestamp, the image key and, if you opt in, your project name.

## Development

```sh
node --test
node src/server.js
```

## Credits

Built by Astra from the MIT-licensed Astra Presence. The bloom artwork is original. This independent companion isn't affiliated with Anthropic; "Claude" is Anthropic's trademark.
