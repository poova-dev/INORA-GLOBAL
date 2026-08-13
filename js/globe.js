/* ==========================================================================
   INORA GLOBAL EXIM - High-Performance Global Trade Network & Flight Animation
   Visual Concept: Silky-smooth 60FPS Interactive Vector Trade Map
   - Removed heavy 3D Earth sphere for zero lag and maximum performance.
   - Illuminated India Origin Hub with glowing radar pulses.
   - Animated golden export arcs to UAE, Saudi Arabia, Qatar, Singapore, Malaysia, Sri Lanka.
   - Cargo flight soaring smoothly from bottom-left towards global trade lanes.
   ========================================================================== */

function initTradeMapCanvas() {
  const container = document.getElementById('hero-globe-canvas-container');
  if (!container) return;

  const canvas = document.getElementById('hero-globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animationFrameId;

  function resizeCanvas() {
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();

  // Trade Hub Coordinates (Normalized to Canvas % Space 0..100)
  const hubs = [
    { id: 'india', name: 'INDIA (ORIGIN)', x: 48, y: 55, isOrigin: true },
    { id: 'uae', name: 'UAE (DUBAI)', x: 38, y: 46 },
    { id: 'saudi', name: 'SAUDI ARABIA', x: 32, y: 48 },
    { id: 'qatar', name: 'QATAR', x: 35, y: 46 },
    { id: 'singapore', name: 'SINGAPORE', x: 68, y: 68 },
    { id: 'malaysia', name: 'MALAYSIA', x: 65, y: 65 },
    { id: 'srilanka', name: 'SRI LANKA', x: 50, y: 68 }
  ];

  // Background Star/Particle Points
  const stars = [];
  const starCount = 60;
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.005 + 0.002
    });
  }

  // Animated Cargo Jet State (Bottom Left -> India -> Trade Routes)
  let flightProgress = 0;
  const flightSpeed = 0.004;

  let pulseAngle = 0;

  function drawScene() {
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Subtle Tech Grid Lines
    ctx.strokeStyle = 'rgba(30, 64, 175, 0.12)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Subtle Ambient Star Particles
    stars.forEach(star => {
      star.alpha += Math.sin(star.speed * 10) * 0.01;
      const px = (star.x / 100) * width;
      const py = (star.y / 100) * height;

      ctx.fillStyle = `rgba(59, 130, 246, ${Math.abs(Math.sin(star.alpha)) * 0.6 + 0.2})`;
      ctx.beginPath();
      ctx.arc(px, py, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    const indiaHub = hubs[0];
    const indiaPx = (indiaHub.x / 100) * width;
    const indiaPy = (indiaHub.y / 100) * height;

    // 3. Draw Trade Route Arcs from India to destinations
    pulseAngle += 0.03;
    hubs.forEach((hub, idx) => {
      if (idx === 0) return; // skip origin self

      const hx = (hub.x / 100) * width;
      const hy = (hub.y / 100) * height;

      // Draw Curved Bezier Arc
      const midX = (indiaPx + hx) / 2;
      const midY = Math.min(indiaPy, hy) - (Math.abs(indiaPx - hx) * 0.3);

      // Arc Shadow Glow
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(indiaPx, indiaPy);
      ctx.quadraticCurveTo(midX, midY, hx, hy);
      ctx.stroke();

      // Main Arc Line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -pulseAngle * 10;
      ctx.beginPath();
      ctx.moveTo(indiaPx, indiaPy);
      ctx.quadraticCurveTo(midX, midY, hx, hy);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Destination Hub Marker
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hx, hy, 7 + Math.sin(pulseAngle + idx) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Destination Hub Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Montserrat, sans-serif';
      ctx.fillText(hub.name, hx + 8, hy + 3);
    });

    // 4. Draw Highlighted India Origin Hub (Golden Radar Pulse)
    const pulseRadius = 12 + Math.sin(pulseAngle * 1.5) * 6;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.beginPath();
    ctx.arc(indiaPx, indiaPy, pulseRadius + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(indiaPx, indiaPy, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(indiaPx, indiaPy, 6, 0, Math.PI * 2);
    ctx.fill();

    // India Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Montserrat, sans-serif';
    ctx.fillText('INDIA (EXPORT ORIGIN)', indiaPx + 12, indiaPy - 8);

    // 5. CARGO JET FLIGHT ANIMATION FROM BOTTOM LEFT (Smooth Quadratic Bezier)
    flightProgress += flightSpeed;
    if (flightProgress > 1) flightProgress = 0;

    const startP = { x: width * 0.05, y: height * 0.9 };  // Bottom Left
    const ctrlP = { x: width * 0.25, y: height * 0.35 };  // Mid Altitude Curve
    const endP = { x: indiaPx, y: indiaPy };               // India Hub

    const t = flightProgress;
    // Bezier Point
    const px = Math.pow(1 - t, 2) * startP.x + 2 * (1 - t) * t * ctrlP.x + Math.pow(t, 2) * endP.x;
    const py = Math.pow(1 - t, 2) * startP.y + 2 * (1 - t) * t * ctrlP.y + Math.pow(t, 2) * endP.y;

    // Tangent angle for plane orientation
    const nextT = Math.min(t + 0.01, 1);
    const npx = Math.pow(1 - nextT, 2) * startP.x + 2 * (1 - nextT) * nextT * ctrlP.x + Math.pow(nextT, 2) * endP.x;
    const npy = Math.pow(1 - nextT, 2) * startP.y + 2 * (1 - nextT) * nextT * ctrlP.y + Math.pow(nextT, 2) * endP.y;
    const angle = Math.atan2(npy - py, npx - px);

    // Engine Jet Light Trail Behind Plane
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startP.x, startP.y);
    ctx.quadraticCurveTo(ctrlP.x, ctrlP.y, px, py);
    ctx.stroke();

    // Draw Stylized Cargo Airplane Glyph
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);

    // Airplane Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(12, 0);       // Nose
    ctx.lineTo(-6, -4);      // Left wing joint
    ctx.lineTo(-10, -12);    // Left wingtip
    ctx.lineTo(-6, -2);      // Tail body
    ctx.lineTo(-12, -7);     // Left tail fin
    ctx.lineTo(-10, 0);      // Rear tail center
    ctx.lineTo(-12, 7);      // Right tail fin
    ctx.lineTo(-6, 2);       // Tail body
    ctx.lineTo(-10, 12);     // Right wingtip
    ctx.lineTo(-6, 4);       // Right wing joint
    ctx.closePath();
    ctx.fill();

    // Airplane Accent Glow
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    animationFrameId = requestAnimationFrame(drawScene);
  }

  drawScene();

  window.addEventListener('resize', () => {
    resizeCanvas();
  });
}

document.addEventListener('DOMContentLoaded', initTradeMapCanvas);
