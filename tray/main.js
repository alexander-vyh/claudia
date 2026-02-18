'use strict';

const { app, Tray, Menu, Notification, shell } = require('electron');
const path = require('path');
const serviceManager = require('./service-manager');
const icons = require('./icons');

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

const STATUS_EMOJI = {
  running: '🟢', stopped: '⚫', error: '🔴', unloaded: '⚪', unknown: '❓'
};

// Project root (where log files live) — resolve from app path or fallback
const PROJECT_DIR = path.resolve(__dirname, '..');

let tray = null;
let previousStatuses = {};
let iconCache = {};

function getIcon(name) {
  if (!iconCache[name]) iconCache[name] = icons[name]();
  return iconCache[name];
}

function getAggregateIcon(statuses) {
  const running = statuses.filter(s => s.status === 'running').length;
  if (running === statuses.length) return getIcon('green');
  if (running === 0) return getIcon('red');
  return getIcon('yellow');
}

function buildMenu(statuses) {
  const runningCount = statuses.filter(s => s.status === 'running').length;

  const serviceItems = statuses.map(svc => {
    const emoji = STATUS_EMOJI[svc.status] || '❓';
    const isRunning = svc.status === 'running';
    const detail = isRunning
      ? `PID ${svc.pid}`
      : (svc.exitCode != null && svc.status === 'error' ? `exit ${svc.exitCode}` : '');

    return {
      label: `${emoji}  ${svc.label}${detail ? '  (' + detail + ')' : ''}`,
      submenu: [
        {
          label: isRunning ? 'Stop' : 'Start',
          click: () => {
            try {
              if (isRunning) serviceManager.stopService(svc.launchdLabel);
              else serviceManager.startService(svc.launchdLabel);
            } catch (e) { /* may throw if already in target state */ }
            setTimeout(refreshStatus, 1500);
          }
        },
        {
          label: 'Restart',
          enabled: isRunning,
          click: () => {
            try { serviceManager.restartService(svc.launchdLabel); } catch (e) {}
            setTimeout(refreshStatus, 1500);
          }
        }
      ]
    };
  });

  return Menu.buildFromTemplate([
    { label: `Claudia — ${runningCount}/${statuses.length} running`, enabled: false },
    { type: 'separator' },
    ...serviceItems,
    { type: 'separator' },
    {
      label: 'Start All',
      click: () => {
        for (const s of statuses) {
          if (s.status !== 'running') {
            try { serviceManager.startService(s.launchdLabel); } catch (e) {}
          }
        }
        setTimeout(refreshStatus, 2000);
      }
    },
    {
      label: 'Stop All',
      click: () => {
        for (const s of statuses) {
          if (s.status === 'running') {
            try { serviceManager.stopService(s.launchdLabel); } catch (e) {}
          }
        }
        setTimeout(refreshStatus, 2000);
      }
    },
    { type: 'separator' },
    {
      label: 'Open Logs Folder',
      click: () => shell.openPath(PROJECT_DIR)
    },
    { type: 'separator' },
    { label: 'Quit Claudia', click: () => app.quit() }
  ]);
}

function refreshStatus() {
  const statuses = serviceManager.getStatuses();

  tray.setImage(getAggregateIcon(statuses));
  const runningCount = statuses.filter(s => s.status === 'running').length;
  tray.setToolTip(`Claudia — ${runningCount}/${statuses.length} services running`);
  tray.setContextMenu(buildMenu(statuses));

  // Notify on running → not-running transitions
  for (const svc of statuses) {
    const prev = previousStatuses[svc.launchdLabel];
    if (prev === 'running' && svc.status !== 'running') {
      new Notification({
        title: `Claudia: ${svc.label} stopped`,
        body: svc.exitCode
          ? `Exit code ${svc.exitCode}. Right-click tray icon to restart.`
          : 'Service stopped.'
      }).show();
    }
  }

  previousStatuses = {};
  for (const svc of statuses) previousStatuses[svc.launchdLabel] = svc.status;
}

app.whenReady().then(() => {
  if (app.dock) app.dock.hide();

  tray = new Tray(getIcon('yellow'));
  tray.setToolTip('Claudia — loading...');

  refreshStatus();
  setInterval(refreshStatus, 10 * 1000);
});

app.on('window-all-closed', (e) => e.preventDefault());
