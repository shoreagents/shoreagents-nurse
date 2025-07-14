// Global polyfill for Electron renderer process
if (typeof global === 'undefined') {
  global = globalThis;
}
if (typeof process === 'undefined') {
  process = { env: {} };
}
if (typeof __dirname === 'undefined') {
  __dirname = '/';
}
if (typeof __filename === 'undefined') {
  __filename = '/index.js';
}

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getVersion: () => process.env.npm_package_version,
  getPlatform: () => process.platform,

  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),

  // File system operations (if needed in the future)
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  // Storage operations
  getStorePath: () => ipcRenderer.invoke('get-store-path'),
  
  // Theme management
  shouldUseDarkColors: () => ipcRenderer.invoke('should-use-dark-colors'),
  onThemeChanged: (callback) => ipcRenderer.on('theme-changed', callback),

  // Print functionality
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),
});

// DOM content loaded event
window.addEventListener('DOMContentLoaded', () => {
  console.log('ShoreAgents Nurse App - Preload script loaded');
}); 