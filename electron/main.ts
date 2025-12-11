import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 开发环境的 Vite 服务器 URL
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: 'STR Form Editor',
  });

  // 加载应用
  if (VITE_DEV_SERVER_URL) {
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理：打开文件对话框
ipcMain.handle('dialog:openFile', async (_, filters?: { name: string; extensions: string[] }[]) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters || [
      { name: 'All Files', extensions: ['*'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'XML Files', extensions: ['xml'] },
    ],
  });

  if (canceled) {
    return null;
  }

  return filePaths[0];
});

// IPC 处理：读取文件内容
ipcMain.handle('fs:readFile', async (_, filePath: string, encoding: BufferEncoding = 'utf-8') => {
  try {
    const content = fs.readFileSync(filePath, encoding);
    return { success: true, data: content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// IPC 处理：保存文件对话框
ipcMain.handle('dialog:saveFile', async (_, defaultPath?: string, filters?: { name: string; extensions: string[] }[]) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath,
    filters: filters || [
      { name: 'XML Files', extensions: ['xml'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) {
    return null;
  }

  return filePath;
});

// IPC 处理：写入文件
ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string, encoding: BufferEncoding = 'utf-8') => {
  try {
    fs.writeFileSync(filePath, content, encoding);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// IPC 处理：获取文件基本名称
ipcMain.handle('path:basename', (_, filePath: string) => {
  return path.basename(filePath);
});
