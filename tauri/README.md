# NextGem Management Desktop App with Tauri

This directory contains instructions for building a desktop application for NextGem Management using Tauri.

## Why Tauri?

Tauri offers several advantages over Electron:
- Smaller app size (5-10MB vs 100MB+ for Electron)
- Better performance and lower memory usage
- Uses the system's WebView instead of bundling Chromium
- Built with Rust for better security

## Prerequisites

- Node.js 16+ installed
- Rust installed (see https://www.rust-lang.org/tools/install)
- macOS development tools installed

## Setting Up Tauri

1. Install Tauri CLI:
```bash
npm install -g @tauri-apps/cli
```

2. Initialize Tauri in your project:
```bash
cd /path/to/nextgem-management
npm install --save-dev @tauri-apps/cli @tauri-apps/api
npx tauri init
```

3. Configure Tauri to point to your deployed app:
   - Edit `src-tauri/tauri.conf.json` to set the URL to your Render deployment

4. Build the macOS application:
```bash
npm run tauri build
```

The built application will be in the `src-tauri/target/release/bundle` directory.

## Customizing Your App

- Update the app name, icons, and other details in `src-tauri/tauri.conf.json`
- Replace the icons in `src-tauri/icons` with your own app icons

## Distributing Your App

After building, you can distribute the `.dmg` or `.app` file to your users. They can install it by:

1. Double-clicking the `.dmg` file
2. Dragging the app to the Applications folder
3. Launching it from the Applications folder

## More Information

For more details, see the [Tauri documentation](https://tauri.app/v1/guides/). 