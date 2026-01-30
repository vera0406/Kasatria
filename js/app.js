/**
 * Main Application Entry Point
 * Initializes the application and connects all modules
 */

import VisualizationApp from './visualization.js';

(async function() {
  'use strict';

  // Show loading indicator
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.add('active');
  }

  try {
    // Initialize data manager and load data
    const data = await dataManager.init();

    console.log(`Loaded ${data.length} data items`);

    // Initialize visualization
    const container = document.getElementById('visualization-container');
    window.visualizationApp = new VisualizationApp(container);

    // Create 3D objects from data
    window.visualizationApp.createObjects(data);

    // Start animation loop
    window.visualizationApp.animate();

    // Hide loading indicator
    if (loadingEl) {
      loadingEl.classList.remove('active');
    }

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);

    // Show error message
    if (loadingEl) {
      loadingEl.innerHTML = '<div style="color: #dc2626;">Error loading data. Please check your configuration.</div>';
    }
  }
})();