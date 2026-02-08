/**
 * Telegram Mini App (TMA) SDK Integration Hook
 * 
 * ENVIRONMENT SEPARATION ("Air Gap"):
 * - All Telegram-specific logic is STRICTLY gated to mode: 'player'
 * - Studio Mode (Creator) is completely unaffected by TMA constraints
 * 
 * SDK Features (8.0+):
 * - Viewport locking & swipe-to-close prevention
 * - Native BackButton & MainButton
 * - Haptic feedback
 * - CloudStorage persistence
 * - User identity extraction
 */

import { useEffect, useState, useCallback, useRef } from 'react';

// TMA SDK types
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TelegramInitData {
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  isVersionAtLeast: (version: string) => boolean;
  
  // Safe area insets
  safeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  contentSafeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Back Button
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    isVisible: boolean;
  };
  
  // Main Button
  MainButton: {
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    setParams: (params: { color?: string; text_color?: string; text?: string; is_active?: boolean; is_visible?: boolean }) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    isVisible: boolean;
    isActive: boolean;
    text: string;
    color: string;
    textColor: string;
  };
  
  // Haptic Feedback
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  
  // Cloud Storage
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: Error | null, result?: boolean) => void) => void;
    getItem: (key: string, callback: (error: Error | null, result?: string) => void) => void;
    getItems: (keys: string[], callback: (error: Error | null, result?: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null, result?: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: Error | null, result?: boolean) => void) => void;
    getKeys: (callback: (error: Error | null, result?: string[]) => void) => void;
  };
  
  // Init data
  initDataUnsafe: TelegramInitData;
  initData: string;
  
  // Platform info
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export type AppMode = 'creator' | 'player';

interface TMAState {
  isInitialized: boolean;
  isTelegramEnvironment: boolean;
  user: TelegramUser | null;
  safeAreaTop: number;
  safeAreaBottom: number;
  colorScheme: 'light' | 'dark';
  savedProgress: {
    sceneIndex: number;
    pxp: number;
  } | null;
}

interface TMAActions {
  // Viewport
  lockViewport: () => void;
  unlockViewport: () => void;
  setHeaderColor: (color: string) => void;
  
  // Navigation
  showBackButton: () => void;
  hideBackButton: () => void;
  onBackButtonClick: (callback: () => void) => void;
  offBackButtonClick: (callback: () => void) => void;
  
  // Main Button
  showMainButton: (text: string, color?: string) => void;
  hideMainButton: () => void;
  onMainButtonClick: (callback: () => void) => void;
  offMainButtonClick: (callback: () => void) => void;
  setMainButtonLoading: (loading: boolean) => void;
  
  // Haptics
  hapticImpact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  hapticNotification: (type: 'success' | 'error' | 'warning') => void;
  hapticSelection: () => void;
  
  // Cloud Storage
  saveProgress: (sceneIndex: number, pxp: number) => Promise<void>;
  loadProgress: () => Promise<{ sceneIndex: number; pxp: number } | null>;
  clearProgress: () => Promise<void>;
}

export interface UseTelegramAppResult {
  mode: AppMode;
  state: TMAState;
  actions: TMAActions;
  isPlayerMode: boolean;
  isCreatorMode: boolean;
}

/**
 * Main hook for Telegram Mini App integration
 * @param mode - 'creator' for Studio mode, 'player' for gameplay mode
 */
export function useTelegramApp(mode: AppMode = 'creator'): UseTelegramAppResult {
  const [state, setState] = useState<TMAState>({
    isInitialized: false,
    isTelegramEnvironment: false,
    user: null,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    colorScheme: 'dark',
    savedProgress: null,
  });
  
  const backButtonCallbackRef = useRef<(() => void) | null>(null);
  const mainButtonCallbackRef = useRef<(() => void) | null>(null);
  
  const isPlayerMode = mode === 'player';
  const isCreatorMode = mode === 'creator';
  
  // Get Telegram WebApp instance (only in player mode)
  const getWebApp = useCallback((): TelegramWebApp | null => {
    if (!isPlayerMode) return null;
    return window.Telegram?.WebApp || null;
  }, [isPlayerMode]);
  
  // Initialize TMA SDK (only in player mode)
  useEffect(() => {
    if (!isPlayerMode) {
      setState(prev => ({ ...prev, isInitialized: true, isTelegramEnvironment: false }));
      return;
    }
    
    const webApp = getWebApp();
    if (!webApp) {
      console.log('[TMA] Not running in Telegram environment');
      setState(prev => ({ ...prev, isInitialized: true, isTelegramEnvironment: false }));
      return;
    }
    
    console.log('[TMA] Initializing Telegram Mini App SDK...');
    
    // 1. Signal app is ready
    webApp.ready();
    
    // 2. Expand to full height
    webApp.expand();
    
    // 3. Enable closing confirmation for sticky app experience
    if (webApp.isVersionAtLeast('6.2')) {
      webApp.enableClosingConfirmation();
    }
    
    // 4. Disable swipe-to-close (SDK 8.0+)
    try {
      // @ts-ignore - SDK 8.0 method
      if (webApp.isVersionAtLeast('8.0') && typeof webApp.disableVerticalSwipes === 'function') {
        // @ts-ignore
        webApp.disableVerticalSwipes();
      }
    } catch (e) {
      console.log('[TMA] Swipe lock not available on this version');
    }
    
    // 5. Extract user identity
    const user = webApp.initDataUnsafe?.user || null;
    
    // 6. Get safe area insets
    const safeAreaTop = webApp.safeAreaInset?.top || webApp.contentSafeAreaInset?.top || 0;
    const safeAreaBottom = webApp.safeAreaInset?.bottom || webApp.contentSafeAreaInset?.bottom || 0;
    
    setState({
      isInitialized: true,
      isTelegramEnvironment: true,
      user,
      safeAreaTop,
      safeAreaBottom,
      colorScheme: webApp.colorScheme || 'dark',
      savedProgress: null,
    });
    
    console.log('[TMA] SDK Initialized', { 
      version: webApp.version, 
      platform: webApp.platform,
      user: user?.first_name 
    });
    
    return () => {
      // Cleanup
      if (webApp.isVersionAtLeast('6.2')) {
        webApp.disableClosingConfirmation();
      }
    };
  }, [isPlayerMode, getWebApp]);
  
  // ===== ACTIONS =====
  
  // Viewport Actions
  const lockViewport = useCallback(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    webApp.expand();
    if (webApp.isVersionAtLeast('6.2')) {
      webApp.enableClosingConfirmation();
    }
  }, [getWebApp]);
  
  const unlockViewport = useCallback(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    if (webApp.isVersionAtLeast('6.2')) {
      webApp.disableClosingConfirmation();
    }
  }, [getWebApp]);
  
  const setHeaderColor = useCallback((color: string) => {
    const webApp = getWebApp();
    if (!webApp) return;
    try {
      webApp.setHeaderColor(color);
      webApp.setBackgroundColor(color);
    } catch (e) {
      console.log('[TMA] Header color not supported');
    }
  }, [getWebApp]);
  
  // Back Button Actions
  const showBackButton = useCallback(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    webApp.BackButton.show();
  }, [getWebApp]);
  
  const hideBackButton = useCallback(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    webApp.BackButton.hide();
  }, [getWebApp]);
  
  const onBackButtonClick = useCallback((callback: () => void) => {
    const webApp = getWebApp();
    if (!webApp) return;
    
    // Remove previous callback if exists
    if (backButtonCallbackRef.current) {
      webApp.BackButton.offClick(backButtonCallbackRef.current);
    }
    
    backButtonCallbackRef.current = callback;
    webApp.BackButton.onClick(callback);
  }, [getWebApp]);
  
  const offBackButtonClick = useCallback((callback: () => void) => {
    const webApp = getWebApp();
    if (!webApp) return;
    webApp.BackButton.offClick(callback);
    backButtonCallbackRef.current = null;
  }, [getWebApp]);
  
  // Main Button Actions
  const showMainButton = useCallback((text: string, color?: string) => {
    const webApp = getWebApp();
    if (!webApp) return;
    
    webApp.MainButton.setParams({
      text,
      color: color || webApp.themeParams.button_color || '#007AFF',
      text_color: webApp.themeParams.button_text_color || '#FFFFFF',
      is_active: true,
      is_visible: true,
    });
    webApp.MainButton.show();
  }, [getWebApp]);
  
  const hideMainButton = useCallback(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    webApp.MainButton.hide();
  }, [getWebApp]);
  
  const onMainButtonClick = useCallback((callback: () => void) => {
    const webApp = getWebApp();
    if (!webApp) return;
    
    // Remove previous callback if exists
    if (mainButtonCallbackRef.current) {
      webApp.MainButton.offClick(mainButtonCallbackRef.current);
    }
    
    mainButtonCallbackRef.current = callback;
    webApp.MainButton.onClick(callback);
  }, [getWebApp]);
  
  const offMainButtonClick = useCallback((callback: () => void) => {
    const webApp = getWebApp();
    if (!webApp) return;
    webApp.MainButton.offClick(callback);
    mainButtonCallbackRef.current = null;
  }, [getWebApp]);
  
  const setMainButtonLoading = useCallback((loading: boolean) => {
    const webApp = getWebApp();
    if (!webApp) return;
    if (loading) {
      webApp.MainButton.showProgress(true);
    } else {
      webApp.MainButton.hideProgress();
    }
  }, [getWebApp]);
  
  // Haptic Feedback Actions
  const hapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    const webApp = getWebApp();
    if (!webApp) return;
    try {
      webApp.HapticFeedback.impactOccurred(style);
    } catch (e) {
      // Haptics not available
    }
  }, [getWebApp]);
  
  const hapticNotification = useCallback((type: 'success' | 'error' | 'warning') => {
    const webApp = getWebApp();
    if (!webApp) return;
    try {
      webApp.HapticFeedback.notificationOccurred(type);
    } catch (e) {
      // Haptics not available
    }
  }, [getWebApp]);
  
  const hapticSelection = useCallback(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    try {
      webApp.HapticFeedback.selectionChanged();
    } catch (e) {
      // Haptics not available
    }
  }, [getWebApp]);
  
  // Cloud Storage Actions
  const saveProgress = useCallback(async (sceneIndex: number, pxp: number): Promise<void> => {
    const webApp = getWebApp();
    if (!webApp) return;
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ sceneIndex, pxp, timestamp: Date.now() });
      webApp.CloudStorage.setItem('mastery_progress', data, (error) => {
        if (error) {
          console.error('[TMA] Failed to save progress:', error);
          reject(error);
        } else {
          console.log('[TMA] Progress saved:', { sceneIndex, pxp });
          resolve();
        }
      });
    });
  }, [getWebApp]);
  
  const loadProgress = useCallback(async (): Promise<{ sceneIndex: number; pxp: number } | null> => {
    const webApp = getWebApp();
    if (!webApp) return null;
    
    return new Promise((resolve) => {
      webApp.CloudStorage.getItem('mastery_progress', (error, result) => {
        if (error || !result) {
          resolve(null);
        } else {
          try {
            const data = JSON.parse(result);
            resolve({ sceneIndex: data.sceneIndex, pxp: data.pxp });
          } catch {
            resolve(null);
          }
        }
      });
    });
  }, [getWebApp]);
  
  const clearProgress = useCallback(async (): Promise<void> => {
    const webApp = getWebApp();
    if (!webApp) return;
    
    return new Promise((resolve) => {
      webApp.CloudStorage.removeItem('mastery_progress', () => {
        console.log('[TMA] Progress cleared');
        resolve();
      });
    });
  }, [getWebApp]);
  
  const actions: TMAActions = {
    lockViewport,
    unlockViewport,
    setHeaderColor,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    offBackButtonClick,
    showMainButton,
    hideMainButton,
    onMainButtonClick,
    offMainButtonClick,
    setMainButtonLoading,
    hapticImpact,
    hapticNotification,
    hapticSelection,
    saveProgress,
    loadProgress,
    clearProgress,
  };
  
  return {
    mode,
    state,
    actions,
    isPlayerMode,
    isCreatorMode,
  };
}

// Export singleton for player mode usage
let playerModeInstance: UseTelegramAppResult | null = null;

export function getTelegramAppInstance(mode: AppMode = 'player'): UseTelegramAppResult | null {
  if (mode === 'player' && playerModeInstance) {
    return playerModeInstance;
  }
  return null;
}
