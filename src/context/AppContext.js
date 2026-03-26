import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getTagProfile,
  updateTagProfile as storageUpdateTagProfile,
} from '../storage/tagProfile';

/**
 * AppContext holds all in-session state shared across screens.
 * See: specs/001-recipe-swipe-stack/data-model.md → Context Shape
 */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  // URI of the captured ingredient photo — used for display
  const [photoUri, setPhotoUri] = useState(null);

  // Base64 of the captured photo — sent to Claude API
  const [photoBase64, setPhotoBase64] = useState(null);

  // The active RecipeBatch: { cards: RecipeCard[], index: number }
  const [currentBatch, setCurrentBatch] = useState(null);

  // 'idle' | 'loading' | 'showing' | 'error'
  const [status, setStatus] = useState('idle');

  // Human-readable error message when status === 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  // Tag preference weight map { [tag]: number } — loaded from AsyncStorage on mount
  const [tagProfile, setTagProfile] = useState({});

  // Load persisted tag profile on mount
  useEffect(() => {
    getTagProfile().then(setTagProfile);
  }, []);

  /**
   * Updates the tag preference profile in AsyncStorage and refreshes state.
   *
   * @param {string[]} tags
   * @param {'right'|'left'} direction
   */
  const updateTagProfile = useCallback(async (tags, direction) => {
    await storageUpdateTagProfile(tags, direction);
    const refreshed = await getTagProfile();
    setTagProfile(refreshed);
  }, []);

  const value = {
    photoUri,
    setPhotoUri,
    photoBase64,
    setPhotoBase64,
    currentBatch,
    setCurrentBatch,
    status,
    setStatus,
    errorMessage,
    setErrorMessage,
    tagProfile,
    setTagProfile,
    updateTagProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook for consuming AppContext inside any screen or component.
 * Throws if used outside AppProvider.
 */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}

export default AppContext;
