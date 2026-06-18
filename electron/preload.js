const { contextBridge, ipcRenderer } = require('electron')

// Expose des APIs sécurisées au renderer via window.electron
contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('example:ping'),
  // Ajouter ici les fonctions IPC supplémentaires
})
