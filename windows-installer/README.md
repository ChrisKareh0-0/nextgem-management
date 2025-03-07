# Windows Installer for NextGem Management

This directory contains files to create a Windows installer for NextGem Management using Inno Setup.

## Prerequisites

- Windows operating system
- [Inno Setup](https://jrsoftware.org/isdl.php) installed
- Electron app already built using the `create-installer.js` script

## Creating the Installer

1. First, build the Electron app:
   ```
   npm run create-installer
   ```

2. Install Inno Setup from [https://jrsoftware.org/isdl.php](https://jrsoftware.org/isdl.php)

3. Open the `setup.iss` file in Inno Setup Compiler

4. Update the `MyAppURL` value to your actual Render deployment URL

5. Click "Build" > "Compile" to create the installer

6. The installer will be created in the `output` directory

## Customizing the Installer

You can customize the installer by editing the `setup.iss` file:

- Change the application name, version, and publisher
- Modify the installation directory
- Add additional files to be included in the installer
- Customize the installer UI
- Add license agreements or readme files

## Distributing the Installer

The generated `.exe` file is a self-contained installer that can be distributed to users. They can run it to install NextGem Management on their Windows computers.

## Icon File

Make sure to place an `icon.ico` file in this directory for the installer to use. You can convert your application icon to `.ico` format using online tools like [convertio.co](https://convertio.co/png-ico/) or [icoconvert.com](https://icoconvert.com/). 