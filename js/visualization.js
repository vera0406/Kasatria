/**
 * 3D Visualization Module
 * Handles Three.js scene, camera, and 3D object rendering
 */

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

class VisualizationApp {
  constructor(containerElement) {
    this.container = containerElement;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    this.objects = [];
    this.targets = {
      table: [],
      sphere: [],
      helix: [],
      grid: [],
      tetrahedron: []
    };
    this.currentLayout = 'table';

    this.init();
  }

  /**
   * Initialize Three.js scene
   */
  init() {
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.z = 3000;

    // Create scene
    this.scene = new THREE.Scene();

    // Create renderer
    this.renderer = new CSS3DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // Add mouse controls
    this.addControls();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  /**
   * Add mouse/touch controls
   */
  addControls() {
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 500;
    this.controls.maxDistance = 6000;
    this.controls.addEventListener('change', () => this.render());
  }

  /**
   * Create 3D objects from data
   */
  createObjects(data) {
    // Clear existing objects
    this.objects.forEach(obj => {
      this.scene.remove(obj);
    });
    this.objects = [];

    // Create new objects
    data.forEach((item, index) => {
      const element = this.createElementCard(item);
      const object = new CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      this.scene.add(object);
      this.objects.push(object);
    });

    // Calculate layout positions
    this.calculateLayouts(data);

    // Transform to initial layout
    this.transform(this.targets.table, 2000);
  }

  /**
   * Create HTML element card for each data item
   */
  createElementCard(item) {
    const div = document.createElement('div');
    div.className = `element ${dataManager.getColorClass(item.netWorth)}`;

    // Number
    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = item.id;
    div.appendChild(number);

    // Avatar/Photo
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = item.photoUrl;
    avatar.alt = item.name;
    avatar.onerror = function() {
      // Fallback to placeholder if image fails to load
      this.src = 'https://via.placeholder.com/60';
    };
    div.appendChild(avatar);

    // Initials (as symbol)
    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = item.initials;
    div.appendChild(symbol);

    // Details
    const details = document.createElement('div');
    details.className = 'details';
    details.innerHTML = `
      <div class="name">${item.name}</div>
      <div>Age: ${item.age} | ${item.country}</div>
      <div>${item.interest}</div>
      <div><strong>${dataManager.formatNetWorth(item.netWorth)}</strong></div>
    `;
    div.appendChild(details);

    return div;
  }

  /**
   * Calculate positions for all layouts
   */
  calculateLayouts(data) {
    // Table layout (20x10)
    this.calculateTableLayout(data);

    // Sphere layout
    this.calculateSphereLayout(data);

    // Helix layout (double helix)
    this.calculateHelixLayout(data);

    // Grid layout (5x4x10)
    this.calculateGridLayout(data);

    // Tetrahedron layout
    this.calculateTetrahedronLayout(data);
  }

  /**
   * Calculate table layout positions (20x10)
   */
  calculateTableLayout(data) {
    const table = [];
    const cols = 20;
    const rows = 10;

    data.forEach((item, index) => {
      const object = new THREE.Object3D();

      const col = index % cols;
      const row = Math.floor(index / cols);

      object.position.x = col * 160 - (cols * 160) / 2;
      object.position.y = -(row * 180) + (rows * 180) / 2;
      object.position.z = 0;

      table.push(object);
    });

    this.targets.table = table;
  }

  /**
   * Calculate sphere layout positions
   */
  calculateSphereLayout(data) {
    const sphere = [];
    const radius = 900;

    data.forEach((item, index) => {
      const object = new THREE.Object3D();

      const phi = Math.acos(-1 + (2 * index) / data.length);
      const theta = Math.sqrt(data.length * Math.PI) * phi;

      object.position.x = radius * Math.cos(theta) * Math.sin(phi);
      object.position.y = radius * Math.sin(theta) * Math.sin(phi);
      object.position.z = radius * Math.cos(phi);

      const vector = new THREE.Vector3();
      vector.copy(object.position).multiplyScalar(2);

      object.lookAt(vector);

      sphere.push(object);
    });

    this.targets.sphere = sphere;
  }

  /**
   * Calculate double helix layout positions
   */
/**
   * Calculate Double Helix layout
   */
  calculateHelixLayout(data) {
    const helix = [];
    const radius = 700;           // How wide the spiral is
    const verticalSpacing = 30;    // Space between stacked cards

    data.forEach((item, index) => {
      const object = new THREE.Object3D();

      // 1. Determine which strand this card belongs to (0 or 1)
      // Even numbers = Strand 0, Odd numbers = Strand 1
      const strand = index % 2; 
      
      // 2. Determine position in the specific strand
      // We divide by 2 so both strands climb at the same speed
      const strandIndex = Math.floor(index / 2);

      // 3. The Math: Add 180 degrees (Math.PI) to the second strand
      // Strand 0 offset = 0
      // Strand 1 offset = Math.PI (3.14...)
      const phaseOffset = strand * Math.PI;

      // Calculate the angle (theta) around the Y-axis
      // 0.175 controls the tightness of the spiral
      const theta = strandIndex * 0.15 + phaseOffset;
      
      // Calculate vertical position (Y)
      // The -450 centers the helix vertically
      const y = -(strandIndex * verticalSpacing) + 1250;

      // Set positions using Sine/Cosine for the circle shape
      object.position.x = radius * Math.cos(theta);
      object.position.y = y;
      object.position.z = radius * Math.sin(theta);

      // Rotate the object to face outward from the center
      const vector = new THREE.Vector3();
      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;
      object.lookAt(vector);

      helix.push(object);
    });

    this.targets.helix = helix;
  }

  /**
   * Calculate 3D grid layout positions (5x4x10)
   */
  calculateGridLayout(data) {
    const grid = [];
    const cols = 10;  // x-axis
    const rows = 4;  // y-axis
    const depth = 5; // z-axis

    data.forEach((item, index) => {
      const object = new THREE.Object3D();

      const x = index % cols;
      const layer = Math.floor(index / cols);
      const y = Math.floor(layer / depth);
      const z = layer % depth;

      object.position.x = x * 200 - (cols * 200) / 2;
      object.position.y = y * 200 - (rows * 200) / 2;
      object.position.z = z * 200 - (depth * 200) / 2;

      grid.push(object);
    });

    this.targets.grid = grid;
  }/**
   * Calculate Tetrahedron (Pyramid) layout
   * Stacks cards in triangular layers: 1, 3, 6, 10, 15...
   */
  calculateTetrahedronLayout(data) {
    const tetrahedron = [];
    const spacing = 180;  // Horizontal distance between cards
    const height = 160;   // Vertical distance between layers
    
    // Counters to track where we are in the pyramid
    let layer = 1; // Current horizontal layer (1 = top)
    let row = 0;   // Current row within the triangle layer
    let col = 0;   // Current item within the row

    data.forEach((item) => {
      const object = new THREE.Object3D();

      // --- 1. Manage the Pyramid Counters ---
      // If we finish a row (col > row), move to next row
      if (col > row) {
        col = 0;
        row++;
      }
      // If we finish a layer (row >= layer), move to next layer (downwards)
      if (row >= layer) {
        row = 0;
        col = 0;
        layer++;
      }

      // --- 2. Calculate Position ---
      
      // X: Centers the row horizontally
      // (col - row/2) shifts the row to be symmetrical
      object.position.x = (col - row / 2) * spacing;

      // Z: Centers the triangle depth-wise
      // (row - layer/2) shifts the triangle to be centered
      object.position.z = (row - layer / 2) * spacing;

      // Y: Moves down for each layer. 
      // +600 starts it higher up so it's centered on screen
      object.position.y = -(layer * height) + 600;

      // --- 3. Orientation ---
      // Make the card face forward (flat) or tilt slightly if you prefer
      // For now, flat is easiest to read
      const vector = new THREE.Vector3();
      
      // Optional: Uncomment this if you want them to face the center
      // vector.copy(object.position).multiplyScalar(2); 
      // object.lookAt(vector);

      tetrahedron.push(object);

      // Increment column for next card
      col++;
    });

    this.targets.tetrahedron = tetrahedron;
  }

  /**
   * Transform objects to target positions
   */
  transform(targets, duration) {
    TWEEN.removeAll();

    this.objects.forEach((object, index) => {
      const target = targets[index];

      new TWEEN.Tween(object.position)
        .to(
          {
            x: target.position.x,
            y: target.position.y,
            z: target.position.z
          },
          Math.random() * duration + duration
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to(
          {
            x: target.rotation.x,
            y: target.rotation.y,
            z: target.rotation.z
          },
          Math.random() * duration + duration
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    });

    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(() => this.render())
      .start();
  }

  /**
   * Change layout
   */
  changeLayout(layoutName) {
    if (this.targets[layoutName]) {
      this.currentLayout = layoutName;
      this.transform(this.targets[layoutName], 2000);
    }
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    TWEEN.update();
    this.controls.update();
  }

  /**
   * Render scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }
}

// Export for use in other modules
export default VisualizationApp;

// Also make it available globally for non-module scripts
window.VisualizationApp = VisualizationApp;