// Initialize core variables
let speedMultiplier = 1;
let isScaleRealistic = false;
let scene, camera, renderer;
const labelElements = {};

// Scale conversion constants
const AU = 149.6; // 1 Astronomical Unit = 149.6 million km (scaled down 1:1 billion)
const REALISTIC_SCALE_FACTOR = 1 / 1000;

// Planetary data (display scale vs realistic scale)
const planets = [
    {
        name: 'Mercury',
        color: 0x808080,
        display: { size: 0.4, distance: 0.387 * AU, speed: 0.02 },
        real: { size: 0.055 * REALISTIC_SCALE_FACTOR, distance: 0.387 * AU * REALISTIC_SCALE_FACTOR, speed: 0.02 }
    },
    {
        name: 'Venus',
        color: 0xffa500,
        display: { size: 0.9, distance: 0.723 * AU, speed: 0.015 },
        real: { size: 0.095 * REALISTIC_SCALE_FACTOR, distance: 0.723 * AU * REALISTIC_SCALE_FACTOR, speed: 0.015 }
    },
    {
        name: 'Earth',
        color: 0x0000ff,
        display: { size: 1, distance: 1 * AU, speed: 0.01 },
        real: { size: 0.1 * REALISTIC_SCALE_FACTOR, distance: 1 * AU * REALISTIC_SCALE_FACTOR, speed: 0.01 }
    },
    // Add other planets following the same pattern...
];

try {
    // Initialize Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Setup renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Create Sun
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create planets and labels
    planets.forEach(planet => {
        const data = isScaleRealistic ? planet.real : planet.display;
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: planet.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = data.distance;
        scene.add(mesh);

        // Store planet reference
        planet.mesh = mesh;
        planet.currentData = data;

        // Create label
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = planet.name;
        document.body.appendChild(label);
        labelElements[planet.name] = label;
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Camera position
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // Controls
    let isDragging = false;
    let previousPosition = { x: 0, y: 0 };

    // Mouse controls
    document.addEventListener('mousedown', e => {
        isDragging = true;
        previousPosition = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mouseup', () => isDragging = false);
    
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousPosition.x;
        const deltaY = e.clientY - previousPosition.y;
        camera.position.x += deltaX * 0.01;
        camera.position.y -= deltaY * 0.01;
        previousPosition = { x: e.clientX, y: e.clientY };
    });

    // Touch controls
    let touchStart = { x: 0, y: 0 };
    document.addEventListener('touchstart', e => {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    document.addEventListener('touchmove', e => {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - touchStart.x;
        const deltaY = e.touches[0].clientY - touchStart.y;
        camera.position.x += deltaX * 0.01;
        camera.position.y -= deltaY * 0.01;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    // Zoom controls
    document.addEventListener('wheel', e => camera.position.z += e.deltaY * 0.1);
    
    // Speed control
    document.getElementById('speed-control').addEventListener('input', e => {
        speedMultiplier = parseFloat(e.target.value);
    });

    // Scale toggle
    document.getElementById('scale-toggle').addEventListener('click', () => {
        isScaleRealistic = !isScaleRealistic;
        document.getElementById('scale-info').textContent = 
            `Scale: ${isScaleRealistic ? 'Realistic' : 'Display'} (1:${isScaleRealistic ? '1B' : '10M'})`;

        planets.forEach(planet => {
            const data = isScaleRealistic ? planet.real : planet.display;
            planet.mesh.geometry.dispose();
            planet.mesh.geometry = new THREE.SphereGeometry(data.size, 32, 32);
            planet.currentData = data;
        });
    });

    // Update labels
    function updateLabels() {
        planets.forEach(planet => {
            const vector = planet.mesh.position.clone().project(camera);
            const label = labelElements[planet.name];
            
            label.style.left = `${(vector.x * 0.5 + 0.5) * window.innerWidth}px`;
            label.style.top = `${(-vector.y * 0.5 + 0.5) * window.innerHeight}px`;
            label.style.display = vector.z > 1 ? 'none' : 'block';
        });
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        planets.forEach(planet => {
            const speed = planet.currentData.speed * speedMultiplier;
            planet.mesh.position.x = Math.cos(performance.now() * 0.001 * speed) * planet.currentData.distance;
            planet.mesh.position.z = Math.sin(performance.now() * 0.001 * speed) * planet.currentData.distance;
            planet.mesh.rotation.y += 0.01 * speedMultiplier;
        });

        updateLabels();
        renderer.render(scene, camera);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start animation
    animate();
    document.getElementById('loading').remove();

} catch (error) {
    document.getElementById('loading').remove();
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = `
        <h2>Error</h2>
        <p>${error.message}</p>
        <p>Please enable WebGL and try again.</p>
    `;
    errorDiv.style.display = 'block';
    throw error;
}
