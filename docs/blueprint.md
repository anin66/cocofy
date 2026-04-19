# **App Name**: Cocofy

## Core Features:

- Secure User Authentication & Role-Based Access: Utilize Firebase Authentication for email/password login and sign up, ensuring distinct manager and worker dashboards with appropriate role-based routing and access control.
- Manager Dashboard & Job Creation: Managers can access a comprehensive dashboard to create new coconut harvesting jobs, specifying customer details, location, scheduled date, and required workers.
- Worker Job Management Interface: Workers have a streamlined view of assigned jobs, with options to accept or reject assignments and review job details.
- Real-time Job Updates: Implement Firestore ,Firebase Cloud Messaging, Firebase Cloud Functions , listeners to provide instant status updates for jobs, reflecting changes in assignment, acceptance, or completion for both managers and workers.
- Smart Reassignment Assistant: An AI tool to assist managers in finding and assigning alternative workers if initial assignments are rejected, factoring in worker availability and job requirements.
- Firebase Cloud Messaging (FCM) Push Notifications: Deliver critical push notifications to both managers and workers, including job assignment alerts, daily reminders, and worker response updates, functioning even when the app is in the background.
- Manager Job Confirmation Workflow: Enable managers to manually confirm jobs after an automated reminder is sent one day prior to the scheduled date, ensuring readiness and resource allocation.

## Style Guidelines:

- Dark Theme: Primary brand color: a vibrant, rich orange (#EB7619) for interactive elements and highlights. Background color: a deep, dark grey with a subtle warm undertone (#1C1513) to create a sophisticated canvas. Accent color: a bright, vivid coral-red (#F77A7A) to draw attention to important alerts and critical statuses.
- Headlines and prominent UI text will use 'Space Grotesk' (sans-serif) for a modern, tech-forward, and assertive look. Body text and longer descriptions will use 'Inter' (sans-serif) for optimal readability and a neutral, clean appearance.
- Employ a set of modern, minimalist icons with a slightly rounded aesthetic that complement the glassmorphism design. Ensure icons are clear and touch-friendly for all devices.
- A responsive grid and flex layout approach for all screens, maintaining proper spacing and preventing element overlap. Implement an adaptive navigation system that transitions from a persistent sidebar on desktop to a compact hamburger menu or bottom navigation bar on mobile devices. Glassmorphism effects with subtle blurs and transparency will be applied to card elements and interactive sections.
- Smooth, subtle animations throughout the application, including 'Framer Motion'-style transitions for page navigation, element entry (e.g., login screen), and loading states. Interactive elements like buttons and cards will feature refined hover effects to enhance user engagement.