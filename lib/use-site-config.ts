'use client'

import { useEffect, useRef, useState } from 'react'
import { DEFAULT_SITE_CONFIG, isSiteConfig, type SiteConfig } from '@/lib/site-config'

const STORAGE_KEY = 'mosque-site-config-v1'

function readLocalConfig() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const config: unknown = JSON.parse(stored)
    return isSiteConfig(config) ? config : null
  } catch {
    return null
  }
}

export function useSiteConfig(adminToken: string) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)
  const [ready, setReady] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Loading settings…')
  const saveQueue = useRef(Promise.resolve())
  const saveVersion = useRef(0)

  useEffect(() => {
    let active = true

    async function loadConfig() {
      try {
        const response = await fetch('/api/site-config', { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load settings')
        const result: { config: unknown; backendConfigured: boolean } = await response.json()
        if (!active) return
        if (!isSiteConfig(result.config)) throw new Error('Backend returned invalid settings')
        setConfig(result.backendConfigured ? result.config : readLocalConfig() ?? result.config)
      } catch {
        if (!active) return
        setConfig(readLocalConfig() ?? DEFAULT_SITE_CONFIG)
      } finally {
        if (active) {
          setReady(true)
          setSaveStatus('Changes save automatically')
        }
      }
    }

    void loadConfig()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!ready) return

    const version = ++saveVersion.current
    const snapshot = JSON.stringify(config)
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, snapshot)
      } catch {
        setSaveStatus('Browser storage is unavailable')
        return
      }

      if (!adminToken) {
        setSaveStatus('Saved on this device · unlock admin to sync')
        return
      }

      setSaveStatus('Saving…')
      saveQueue.current = saveQueue.current.then(async () => {
        try {
          const response = await fetch('/api/site-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
            body: snapshot,
          })
          if (version !== saveVersion.current) return
          setSaveStatus(response.ok ? 'Saved to backend' : 'Saved on this device · backend not connected')
        } catch {
          if (version === saveVersion.current) setSaveStatus('Saved on this device · backend not connected')
        }
      })
    }, 650)

    return () => window.clearTimeout(timer)
  }, [adminToken, config, ready])

  return { config, setConfig, ready, saveStatus }
}