const { app, shell } = require('electron');

const isMac = process.platform === 'darwin';

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'New Clinic Log',
        accelerator: 'CmdOrCtrl+N',
        click: async () => {
          // Handle new clinic log
        }
      },
      {
        label: 'New Reimbursement',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: async () => {
          // Handle new reimbursement
        }
      },
      { type: 'separator' },
      {
        label: 'Export Records',
        accelerator: 'CmdOrCtrl+E',
        click: async () => {
          // Handle export
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'actualSize' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About ShoreAgents Clinic Dashboard',
        click: async () => {
          await shell.openExternal('https://github.com/shoreagents/nurse-app');
        }
      },
      {
        label: 'User Guide',
        click: async () => {
          // Open user guide
        }
      },
      {
        label: 'Report Issue',
        click: async () => {
          await shell.openExternal('https://github.com/shoreagents/nurse-app/issues');
        }
      }
    ]
  }
];

module.exports = template; 