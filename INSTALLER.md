# Creating Installers for NextGem Management

This guide provides detailed instructions for creating desktop application installers for NextGem Management using Yarn.

## Prerequisites

- Node.js 16+ installed
- Yarn package manager installed
- For macOS builds: macOS operating system
- For Windows builds: Windows operating system or a Windows virtual machine
- For Windows Inno Setup: [Inno Setup](https://jrsoftware.org/isdl.php) installed (Windows only)

## Quick Start

The easiest way to create installers is to use the universal installer creator script:

```bash
# Replace with your actual Render deployment URL
yarn create-installer https://your-render-deployment-url.onrender.com
```

This will automatically create the appropriate installer for your platform:
- On macOS: A `.dmg` installer file
- On Windows: A `.exe` installer file

## Step-by-Step Instructions

### 1. Deploy Your App to Render

Before creating installers, deploy your Next.js app to Render to get a deployment URL:

1. Push your code to GitHub
2. Set up a web service on Render
3. Note the deployment URL (e.g., `https://nextgem-management.onrender.com`)

### 2. Create the Installer

#### Option A: Using the Universal Installer Creator

```bash
# From the project root directory
yarn create-installer https://your-render-deployment-url.onrender.com
```

#### Option B: Creating Platform-Specific Installers Manually

**For macOS:**

```bash
# From the project root directory
cd electron
yarn install
yarn build:mac
```

The DMG installer will be created in the `electron/dist` directory.

**For Windows:**

```bash
# From the project root directory
cd electron
yarn install
yarn build:win
```

The EXE installer will be created in the `electron/dist` directory.

#### Option C: Creating a Windows Installer with Inno Setup

For a more customized Windows installer:

1. First build the Electron app:
   ```bash
   # From the project root directory
   yarn create-installer https://your-render-deployment-url.onrender.com
   ```

2. Install Inno Setup from [https://jrsoftware.org/isdl.php](https://jrsoftware.org/isdl.php)

3. Open the `windows-installer/setup.iss` file in Inno Setup Compiler

4. Update the `MyAppURL` value to your actual Render deployment URL

5. Click "Build" > "Compile" to create the installer

6. The installer will be created in the `windows-installer/output` directory

## Customizing the Installers

### Electron-based Installers

You can customize the Electron-based installers by editing the `electron/package.json` file:

- Change the application name, version, and publisher
- Modify the DMG or NSIS configuration
- Change the icon paths

### Inno Setup Installer (Windows)

You can customize the Inno Setup installer by editing the `windows-installer/setup.iss` file:

- Change the application name, version, and publisher
- Modify the installation directory
- Add additional files to be included in the installer
- Customize the installer UI
- Add license agreements or readme files

## Application Icons

For the best results, provide high-quality icons for your installers:

- For macOS: Create an `icon.icns` file in the `electron/icons` directory
- For Windows: Create an `icon.ico` file in the `electron/icons` directory

You can convert PNG images to these formats using online tools:
- For `.icns`: [CloudConvert](https://cloudconvert.com/png-to-icns)
- For `.ico`: [ConvertICO](https://convertico.com/)

## Troubleshooting

If you encounter issues during the installer creation:

1. **Missing dependencies**: Make sure you have all required dependencies installed
   ```bash
   cd electron
   yarn install
   ```

2. **Build errors**: Check the error messages in the console
   - For macOS-specific errors, make sure you're on a macOS system
   - For Windows-specific errors, make sure you're on a Windows system

3. **Icon errors**: Make sure you have the correct icon files in the `electron/icons` directory

4. **URL errors**: Make sure you've specified the correct Render deployment URL

## Distribution

After creating the installers, you can distribute them to your users:

- Host the files on your website for download
- Share them via cloud storage services
- Distribute them through an app store (requires additional steps)

Users can install the application by:
- On macOS: Double-clicking the DMG file and dragging the app to Applications
- On Windows: Running the EXE installer and following the installation wizard 