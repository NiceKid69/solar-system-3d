let speedMultiplier = 1;
let isScaleRealistic = false;
const labelElements = {};

// Three.js initialization and lighting setup remains the same...

// Planetary data with realistic and display scales
const planets = [
    { 
        name: 'Mercury', 
        display: { size: 0.4, distance: 5 }, 
        real: { size: 0.055, distance: 0.387 }, 
        color: 0x808080, 
        speed: 0.02 
    },
    // ... similar structure for other planets ...
];

// Create planets with initial display scale
const planetMeshes = planets.map(planet => {
    const data = isScaleRealistic ? planet.real : planet.display;
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = data.distance;
    scene.add(mesh);

    // Create label element
    const label = document.createElement('div');
    label.className = 'planet-label';
    label.textContent = planet.name;
    document.body.appendChild(label);
    labelElements[planet.name] = label;

    return { 
        ...planet, 
        mesh, 
        angle: Math.random() * Math.PI * 2,
        currentDistance: data.distance,
        currentSize: data.size
    };
});

// Add touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchZoomStart = 0;

document.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        touchZoomStart = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
});

document.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        camera.position.x += deltaX * 0.01;
        camera.position.y -= deltaY * 0.01;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        const touchZoom = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        camera.position.z += (touchZoomStart - touchZoom) * 0.01;
        touchZoomStart = touchZoom;
    }
});

// Speed control
document.getElementById('speed-control').addEventListener('input', (e) => {
    speedMultiplier = parseFloat(e.target.value);
});

// Scale toggle
document.getElementById('scale-toggle').addEventListener('click', () => {
    isScaleRealistic = !isScaleRealistic;
    document.getElementById('scale-info').textContent = 
        `Scale: ${isScaleRealistic ? 'Realistic' : 'Display'} (${isScaleRealistic ? '1:1' : '1:1000'})`;

    planetMeshes.forEach(planet => {
        const data = isScaleRealistic ? planet.real : planet.display;
        planet.currentDistance = data.distance;
        planet.currentSize = data.size;
        
        // Update mesh geometry
        planet.mesh.geometry.dispose();
        planet.mesh.geometry = new THREE.SphereGeometry(data.size, 32, 32);
        planet.mesh.geometry.needsUpdate = true;
    });
});

// Update labels in animation loop
function updateLabels() {
    planetMeshes.forEach(planet => {
        const label = labelElements[planet.name];
        const vector = planet.mesh.position.clone().project(camera);
        
        label.style.left = `${(vector.x * 0.5 + 0.5) * window.innerWidth}px`;
        label.style.top = `${(-vector.y * 0.5 + 0.5) * window.innerHeight}px`;
        label.style.display = vector.z > 1 ? 'none' : 'block';
    });
}

// Modified animation loop
function animate() {
    requestAnimationFrame(animate);

    planetMeshes.forEach(planet => {
        planet.angle += planet.speed * speedMultiplier;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.currentDistance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.currentDistance;
        planet.mesh.rotation.y += 0.01 * speedMultiplier;
    });

    updateLabels();
    sun.rotation.y += 0.001 * speedMultiplier;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

// Rest of the code (resize handler, etc) remains the same...
