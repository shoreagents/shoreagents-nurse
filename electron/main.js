const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  const url = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  console.log('Loading URL:', url);
  console.log('isDev:', isDev);
  console.log('__dirname:', __dirname);
  console.log('app.isPackaged:', app.isPackaged);

  // Add a small delay for development to ensure Next.js is ready
  if (isDev) {
    setTimeout(() => {
      mainWindow.loadURL(url);
    }, 1000);
  } else {
    // For production, try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../out/index.html'),
      path.join(__dirname, '../app/index.html'),
      path.join(process.resourcesPath, 'app/index.html')
    ];
    
    let loadPath = possiblePaths[0];
    for (const possiblePath of possiblePaths) {
      if (require('fs').existsSync(possiblePath)) {
        loadPath = possiblePath;
        break;
      }
    }
    
    console.log('Loading from:', loadPath);
    mainWindow.loadFile(loadPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorDescription);
    if (isDev) {
      // Show a simple error page or retry
      mainWindow.loadURL('data:text/html,<h1>Loading...</h1><p>Waiting for Next.js dev server...</p><script>setTimeout(() => location.reload(), 2000)</script>');
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Set application menu
  const menu = Menu.buildFromTemplate(require('./menu'));
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Handle cleanup before quitting
});

// Handle protocol for production
if (!isDev) {
  app.setAsDefaultProtocolClient('shoreagents-nurse-app');
} 