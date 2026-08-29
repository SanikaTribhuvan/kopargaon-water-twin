// Application Bootstrap for Kopargaon Civic Triage Digital Twin
import { AppController } from './ui/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
  window.kmcApp = app; // Expose for debugging & inspection if needed
});
