# Cocofy - Coconut Harvest Management

Smart job management for coconut harvesting teams, built with Next.js, Firebase, and AI.

## Deployment Instructions

To deploy this application to the cloud, you can use the following terminal commands:

### 1. Install Firebase CLI
If you haven't already, install the Firebase tools globally:
```bash
npm install -g firebase-tools
```

### 2. Login & Initialize
Authenticate your terminal session and ensure the project is linked:
```bash
firebase login
firebase init
```

### 3. Deploy to Hosting
For a standard static/SSR deployment:
```bash
firebase deploy --only hosting
```

### 4. Firebase App Hosting (Recommended for Next.js 15)
Since this project includes `apphosting.yaml`, the best way to deploy is to:
1. Push your code to a **GitHub** repository.
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Navigate to **App Hosting** and connect your GitHub repo.
4. Firebase will automatically build and deploy your Next.js app on every push.

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:9002`.
