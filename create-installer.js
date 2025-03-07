/**
 * NextGem Management Installer Creator
 * 
 * This script creates an installer for the NextGem Management application.
 * It supports both macOS and Windows platforms.
 */

const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configuration
const appName = 'NextGem Management';
const appVersion = '1.0.0';
const electronDir = path.join(__dirname, 'electron');
const renderUrl = process.argv[2] || 'https://your-render-deployment-url.onrender.com';

console.log('='.repeat(80));
console.log(`NextGem Management Installer Creator`);
console.log('='.repeat(80));
console.log(`Platform: ${os.platform()}`);
console.log(`Render URL: ${renderUrl}`);
console.log('');

// Check if Electron directory exists
if (!fs.existsSync(electronDir)) {
  console.log('Creating Electron directory...');
  fs.mkdirSync(electronDir, { recursive: true });
  
  // Copy Electron files from templates
  console.log('Copying Electron files...');
  const templateDir = path.join(__dirname, 'electron-template');
  if (fs.existsSync(templateDir)) {
    copyDir(templateDir, electronDir);
  } else {
    console.log('Creating Electron files from scratch...');
    createElectronFiles();
  }
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(electronDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Check for icon files
const macIconPath = path.join(iconsDir, 'icon.icns');
const winIconPath = path.join(iconsDir, 'icon.ico');

if (!fs.existsSync(macIconPath) && os.platform() === 'darwin') {
  console.log('Warning: macOS icon file not found. Please create an icon.icns file in the electron/icons directory.');
}

if (!fs.existsSync(winIconPath) && os.platform() === 'win32') {
  console.log('Warning: Windows icon file not found. Please create an icon.ico file in the electron/icons directory.');
}

// Update server URL in main.js
console.log(`Setting server URL to: ${renderUrl}`);
const mainJsPath = path.join(electronDir, 'main.js');
if (fs.existsSync(mainJsPath)) {
  let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
  mainJsContent = mainJsContent.replace(
    /const serverUrl = process\.env\.SERVER_URL \|\| '.*?';/,
    `const serverUrl = process.env.SERVER_URL || '${renderUrl}';`
  );
  fs.writeFileSync(mainJsPath, mainJsContent);
}

// Install dependencies
console.log('Installing Electron dependencies...');
try {
  execSync('npm install', { cwd: electronDir, stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error(`Error installing dependencies: ${error.message}`);
  process.exit(1);
}

// Build the installer
console.log('Building installer...');
const buildCommand = os.platform() === 'win32' ? 'npm run build:win' : 'npm run build:mac';
try {
  execSync(buildCommand, { cwd: electronDir, stdio: 'inherit' });
  console.log('Installer built successfully!');
  
  const outputDir = path.join(electronDir, 'dist');
  if (os.platform() === 'win32') {
    console.log(`Installer can be found at: ${path.join(outputDir, `${appName} Setup ${appVersion}.exe`)}`);
  } else {
    console.log(`Installer can be found at: ${path.join(outputDir, `${appName}-${appVersion}.dmg`)}`);
  }
} catch (error) {
  console.error(`Error building installer: ${error.message}`);
  process.exit(1);
}

// Helper function to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper function to create Electron files from scratch
function createElectronFiles() {
  // Create main.js
  const mainJs = `const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const serverUrl = process.env.SERVER_URL || '${renderUrl}';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset', // Gives a more native macOS look
    backgroundColor: '#ffffff',
  });

  // Load the app
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : serverUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
  const template = [
    {
      label: 'NextGem Management',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// On macOS, re-create window when dock icon is clicked and no windows are open
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});`;

  fs.writeFileSync(path.join(electronDir, 'main.js'), mainJs);

  // Create package.json
  const packageJson = {
    name: "nextgem-management-desktop",
    version: "1.0.0",
    description: "NextGem Management Desktop App",
    main: "main.js",
    scripts: {
      start: "electron .",
      dev: "cross-env NODE_ENV=development electron .",
      build: "electron-builder",
      "build:mac": "electron-builder --mac",
      "build:win": "electron-builder --win"
    },
    author: "NextGem Management",
    license: "MIT",
    devDependencies: {
      "cross-env": "^7.0.3",
      "electron": "^28.1.0",
      "electron-builder": "^24.9.1"
    },
    build: {
      appId: "com.nextgem.management",
      productName: "NextGem Management",
      mac: {
        category: "public.app-category.business",
        icon: "icons/icon.icns",
        target: ["dmg", "zip"]
      },
      win: {
        icon: "icons/icon.ico",
        target: [
          {
            target: "nsis",
            arch: ["x64"]
          }
        ]
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "NextGem Management"
      },
      dmg: {
        contents: [
          {
            x: 130,
            y: 220
          },
          {
            x: 410,
            y: 220,
            type: "link",
            path: "/Applications"
          }
        ]
      }
    }
  };

  fs.writeFileSync(path.join(electronDir, 'package.json'), JSON.stringify(packageJson, null, 2));
} 