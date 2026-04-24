
'use client';

import { useState, useEffect } from 'react';
import { getFirebaseMessaging } from '@/firebase/messaging';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const VAPID_KEY = 'BNSak5PEIVpo5WhPuJezKvOkyFrylJyJEU0bohT78_0pZW9LA7YjiTNCT3nTDWGYMxwdTip00jFqLSP8MgGumjM';

export function useFCM() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubscribe: any;

    const setupListener = async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const { onMessage } = await import('firebase/messaging');
        unsubscribe = onMessage(messaging, (payload) => {
          toast({
            title: payload.notification?.title || 'Notification',
            description: payload.notification?.body || '',
          });
        });
      } catch (err) {
        console.error('FCM Foreground Listener Error:', err);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [toast]);

  const requestPermission = async () => {
    if (!user || !db || isRegistering) return false;
    
    setIsRegistering(true);
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        throw new Error('Notifications not supported in this browser.');
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        const messaging = await getFirebaseMessaging();
        if (!messaging) throw new Error('FCM not supported or initialized.');

        const { getToken } = await import('firebase/messaging');
        const token = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (token) {
          await updateDoc(doc(db, 'users', user.uid), {
            fcmTokens: arrayUnion(token)
          });
          
          toast({
            title: "Notifications Enabled",
            description: "You will now receive real-time alerts."
          });
          return true;
        }
      }
    } catch (error: any) {
      console.error('FCM Registration Error:', error);
      toast({
        variant: "destructive",
        title: "Setup Error",
        description: error.message
      });
    } finally {
      setIsRegistering(false);
    }
    return false;
  };

  return {
    permissionStatus,
    requestPermission,
    isRegistering,
    hasToken: permissionStatus === 'granted'
  };
}
