import React, { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
  }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
    appinstalled: Event
  }
}

const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const isDev = import.meta.env.DEV

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    console.log('InstallButton: isStandalone', isStandalone)
    if (isStandalone) {
      setIsInstalled(true)
      console.log('InstallButton: Already installed, hiding button')
      return
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('InstallButton: beforeinstallprompt event fired')
      // Prevent the mini-infobar from appearing on mobile - we'll handle it ourselves
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('InstallButton: Installable set to true')
    }

    const handleAppInstalled = () => {
      console.log('InstallButton: appinstalled event fired')
      // Hide the app-provided install promotion
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )
    window.addEventListener('appinstalled', handleAppInstalled)
    console.log('InstallButton: Event listeners added')

    // Force show in dev mode for testing
    if (isDev) {
      console.log(
        'InstallButton: Dev mode - forcing button visibility for testing'
      )
      setIsInstallable(true)
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      console.log('InstallButton: Event listeners removed')
    }
  }, [isDev])

  const handleInstallClick = async () => {
    console.log('InstallButton: Install button clicked')
    if (!deferredPrompt) {
      if (isDev) {
        console.log('InstallButton: Dev mode - simulating install')
        alert(
          'In development mode: PWA install simulation. In production (HTTPS), this would trigger the real install prompt.'
        )
        setIsInstalled(true)
        setIsInstallable(false)
      } else {
        console.log('InstallButton: No deferredPrompt available')
      }
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  // Don't render if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 left-4 z-50 bg-yellow-400 text-indigo-900 px-4 py-2 rounded-full font-bold text-sm sm:text-base hover:bg-yellow-300 hover:scale-105 transition-all duration-200 border-2 border-indigo-600"
    >
      Install MYM Nexus 📱
    </button>
  )
}

export default InstallButton
