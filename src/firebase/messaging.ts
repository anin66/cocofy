
'use client';

import { getApp, getApps } from 'firebase/app';

export async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  
  try {
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported) return null;

    if (getApps().length > 0) {
      return getMessaging(getApp());
    }
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
  return null;
}
