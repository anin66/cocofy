import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

/**
 * Triggered when a new notification is created in Firestore.
 * Logs the event. FCM sending functionality has been removed.
 */
export const onNotificationCreated = onDocumentCreated("notifications/{notificationId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const notification = snapshot.data();
  console.log(`Notification created for user ${notification.userId}: ${notification.title}`);
  
  // FCM push notification sending logic has been removed.
});
