# NextGem Management Desktop App with Nativefier

This directory contains instructions for building a desktop application for NextGem Management using Nativefier.

## Why Nativefier?

Nativefier is the simplest way to create a desktop app from a website:
- No coding required
- Single command to create an app
- Works on macOS, Windows, and Linux
- Customizable with various options

## Prerequisites

- Node.js 16+ installed
- npm installed

## Creating the App

1. Install Nativefier globally:
```bash
npm install -g nativefier
```

2. Create the macOS application:
```bash
nativefier --name "NextGem Management" \
  --icon ./icon.png \
  --width 1200 \
  --height 800 \
  --min-width 800 \
  --min-height 600 \
  --counter \
  --bounce \
  --single-instance \
  --darwin-dark-mode-support \
  --title-bar-style hidden \
  "https://your-render-deployment-url.onrender.com" \
  ./build
```

Replace `https://your-render-deployment-url.onrender.com` with your actual deployed URL.

The built application will be in the `build` directory.

## Customizing Your App

- Create a 1024x1024 PNG icon file named `icon.png` in this directory
- Adjust the width, height, and other parameters in the command above
- See all available options with `nativefier --help`

## Distributing Your App

After building, you can distribute the `.app` file to your users. They can install it by:

1. Copying the `.app` file to their Applications folder
2. Launching it from the Applications folder

## Creating a DMG Installer

To create a DMG installer for easier distribution:

1. Install create-dmg:
```bash
npm install -g create-dmg
```

2. Create the DMG:
```bash
create-dmg \
  --volname "NextGem Management" \
  --volicon "icon.icns" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "NextGem Management.app" 200 190 \
  --hide-extension "NextGem Management.app" \
  --app-drop-link 600 185 \
  "NextGem Management.dmg" \
  "./build/NextGem Management-darwin-x64/NextGem Management.app"
```

## More Information

For more details, see the [Nativefier documentation](https://github.com/nativefier/nativefier). 