
import { setGlobalOptions } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

export const onJobWritten = onDocumentWritten("jobs/{jobId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const after = snapshot.after?.data();
  if (!after) return;

  // Internal state processing can happen here if needed.
  // Push notifications have been removed as requested.
});
