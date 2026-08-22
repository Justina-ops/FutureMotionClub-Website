/**
 * FutureMotion Club — Custom Glow Cursor with Particle Trail
 * 
 * This script creates a glowing custom cursor with an elastic trailing effect
 * on desktop devices. It gracefully degrades on touch devices.
 */

(function () {
  "use strict";

  // --- 1. Touch Device Detection ---
  // Disable the custom cursor on touch-only devices (mobile/tablets) to prevent
  // visual glitches and improve native touch experience.
  if ('ontouchstart' in window) return;

  // --- 2. Create the Main Cursor Element ---
  // Create a div for the main glowing cursor, add the required class, and append
  // it to the body.
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  // --- 3. Create the Trail Elements ---
  // Define the number of trailing dots to form the particle trail.
  const trailCount = 8;
  const trails = [];

  // Create each trail dot element and store its state (DOM element, current X/Y,
  // and specific delay for smooth following).
  for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    document.body.appendChild(dot);
    trails.push({
      el: dot,
      x: 0,
      y: 0,
      delay: i * 30 // 30ms delay between each trail dot
    });
  }

  // --- 4. Mouse Tracking Variables ---
  // Store the current mouse coordinates on the screen.
  let mouseX = 0;
  let mouseY = 0;

  // --- 5. Mouse Move Event Listener ---
  // Update the main cursor's position immediately when the mouse moves.
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // --- 6. Trail Animation Loop ---
  // Smoothly animate the trailing dots towards the cursor position using
  // elastic easing logic. The dots follow each other in a chain.
  function updateTrails() {
    let prevX = mouseX;
    let prevY = mouseY;

    trails.forEach((trail, index) => {
      // Calculate the step towards the previous dot's position.
      // A factor of 0.15 creates a smooth, delayed movement.
      trail.x += (prevX - trail.x) * 0.15;
      trail.y += (prevY - trail.y) * 0.15;

      // Apply calculated coordinates to the DOM element.
      trail.el.style.left = trail.x + 'px';
      trail.el.style.top = trail.y + 'px';

      // Dynamically adjust the size and opacity of the trail dots.
      // The further back a dot is, the smaller and more transparent it becomes.
      const scale = 1 - (index / trails.length) * 0.7;
      const opacity = 1 - (index / trails.length) * 0.8;

      trail.el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      trail.el.style.opacity = opacity;

      // Update the chain positions so the next dot follows this one.
      prevX = trail.x;
      prevY = trail.y;
    });

    // Request the next animation frame for a smooth 60FPS update.
    requestAnimationFrame(updateTrails);
  }

  // Start the animation loop.
  updateTrails();

})();