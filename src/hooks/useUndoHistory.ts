import { useState, useCallback, useEffect } from 'react';

export interface HistoryAction {
  type: string;
  description: string;
  previousValue: any;
  currentValue: any;
  timestamp: number;
}

interface UseUndoHistoryReturn<T> {
  state: T;
  setState: (newState: T, actionType?: string, description?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: HistoryAction[];
  clear: () => void;
}

/**
 * useUndoHistory - Studio Canvas Undo System
 * 
 * Tracks state changes with a history stack for undo/redo functionality.
 * Supports keyboard shortcuts (Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo).
 */
export function useUndoHistory<T>(
  initialState: T,
  maxHistory: number = 50
): UseUndoHistoryReturn<T> {
  const [state, setStateInternal] = useState<T>(initialState);
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const setState = useCallback((
    newState: T,
    actionType: string = 'change',
    description: string = 'State changed'
  ) => {
    const action: HistoryAction = {
      type: actionType,
      description,
      previousValue: state,
      currentValue: newState,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any redo history when new action is performed
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new action and limit history size
      const updated = [...newHistory, action].slice(-maxHistory);
      return updated;
    });

    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
    setStateInternal(newState);
  }, [state, historyIndex, maxHistory]);

  const undo = useCallback(() => {
    if (!canUndo) return;

    const action = history[historyIndex];
    setStateInternal(action.previousValue);
    setHistoryIndex(prev => prev - 1);
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    const nextAction = history[historyIndex + 1];
    setStateInternal(nextAction.currentValue);
    setHistoryIndex(prev => prev + 1);
  }, [canRedo, history, historyIndex]);

  const clear = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (modKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (modKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    clear,
  };
}
