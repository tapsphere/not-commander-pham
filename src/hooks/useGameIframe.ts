import { useEffect, useState, useRef, useCallback } from 'react';
import { extractWindowObjects, WindowResult, WindowProof } from '@/utils/v3Validator';

interface UseGameIframeOptions {
  onComplete?: (result: WindowResult | null, proof: WindowProof | null) => void;
  onError?: (error: string) => void;
}

export function useGameIframe(options: UseGameIframeOptions = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<WindowResult | null>(null);
  const [proof, setProof] = useState<WindowProof | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  // Poll iframe for result objects
  const checkForResults = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;

    try {
      const objects = extractWindowObjects(iframeRef.current.contentWindow);
      
      // If we have a result object, the game is complete
      if (objects.result) {
        setResult(objects.result);
        setProof(objects.proof);
        
        // Stop polling
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        // Notify parent
        options.onComplete?.(objects.result, objects.proof);
      }
    } catch (error) {
      console.error('Error checking iframe results:', error);
      options.onError?.('Failed to read game results');
    }
  }, [options]);

  // Listen for postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: check origin if needed
      if (event.data?.type === 'GAME_COMPLETE') {
        checkForResults();
      }
      
      if (event.data?.type === 'GAME_READY') {
        setIsReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkForResults]);

  // Start polling when iframe loads
  const handleIframeLoad = useCallback(() => {
    setIsReady(true);
    
    // Start polling for results every 2 seconds
    checkIntervalRef.current = window.setInterval(checkForResults, 2000);
  }, [checkForResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Send message to iframe
  const sendMessage = useCallback((message: any) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(message, '*');
  }, []);

  return {
    iframeRef,
    isReady,
    result,
    proof,
    handleIframeLoad,
    sendMessage,
    checkForResults,
  };
}
