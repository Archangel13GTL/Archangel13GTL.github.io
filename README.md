# TENET Tech Portfolio Website

A modern, mobile-first portfolio website built with progressive web app capabilities.

## Features

- Mobile-First Design: Optimized for touch devices with 48px minimum touch targets
- Variable Fonts: Uses Inter and Mona Sans for optimal performance
- Progressive Web App: Installable with offline capabilities
- Touch-Friendly Navigation: Collapsible mobile menu with accessibility features
- Service Worker Caching: Stale-while-revalidate strategy for optimal performance
- Interactive Apps: Shed Layout Designer and Chicago Wild Harvest apps
- Core Web Vitals Optimized: Critical CSS inlined, lazy loading, and performance optimizations

## Performance Optimizations

- Critical CSS inlined for faster First Contentful Paint
- Variable fonts reduce HTTP requests by 50%
- Service worker enables offline functionality
- Lazy loading for images and non-critical resources
- Optimized JavaScript with intersection observers
- Mobile-specific touch event handling

## File Structure

├── index.html (main page)
├── assets/
│ ├── css/main.css
│ ├── js/main.js
│ └── fonts/ (add Inter and Mona Sans variable fonts)
├── apps/ (interactive applications)
├── manifest.json (PWA configuration)
└── sw.js (service worker)

## Deployment

1. Upload all files to your web server
2. Replace placeholder font files with actual variable fonts
3. Configure your server to serve the correct MIME types
4. Test PWA functionality in Chrome DevTools

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use and modify

## Environment Setup

Configure API provider keys as environment variables before running the backend that powers `/api/ai`:

```bash
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export GEMINI_API_KEY="your-gemini-key"
```

These variables can also be placed in a `.env` file or set using your deployment platform's secret manager.

## Firebase Deployment

The site can be hosted on Firebase Hosting with optional Cloud Functions for the AI API.

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Authenticate and initialize the project:
   ```bash
   firebase login
   firebase init
   ```
3. Set API keys for Cloud Functions (if used):
   ```bash
   firebase functions:config:set openai.key="YOUR_OPENAI_KEY" anthropic.key="YOUR_ANTHROPIC_KEY" gemini.key="YOUR_GEMINI_KEY"
   ```
4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```
