import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的 API 类型
export interface ElectronAPI {
  // 对话框相关
  openFileDialog: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
  saveFileDialog: (defaultPath?: string, filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;

  // 文件系统相关
  readFile: (filePath: string, encoding?: BufferEncoding) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, content: string, encoding?: BufferEncoding) => Promise<{ success: boolean; error?: string }>;

  // 路径相关
  getBasename: (filePath: string) => Promise<string>;
}

// 暴露 API 到渲染进程
const electronAPI: ElectronAPI = {
  openFileDialog: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
  saveFileDialog: (defaultPath, filters) => ipcRenderer.invoke('dialog:saveFile', defaultPath, filters),
  readFile: (filePath, encoding) => ipcRenderer.invoke('fs:readFile', filePath, encoding),
  writeFile: (filePath, content, encoding) => ipcRenderer.invoke('fs:writeFile', filePath, content, encoding),
  getBasename: (filePath) => ipcRenderer.invoke('path:basename', filePath),
};

// 在渲染进程中使用类型安全的方式暴露 API
contextBridge.exposeInMainWorld('electron', electronAPI);
