"use client"

const KEY = "macwall_installer_downloaded"

/** Remembers that this browser downloaded the installer (so the app is likely on this Mac). */
export function markInstallerDownloaded() {
  try {
    window.localStorage.setItem(KEY, "1")
  } catch {
    // Private mode or blocked storage: the visitor just sees "Download free".
  }
}

export function hasDownloadedInstaller(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}
