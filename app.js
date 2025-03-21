// Three.js initialization
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup
const light = new THREE.PointLight(0xffffff, 1.5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Create Sun
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planetary data
const planets = [
    { name: 'Mercury', size: 0.4, distance: 5, color: 0x808080, speed: 0.02 },
    { name: 'Venus', size: 0.9, distance: 7, color: 0xffa500, speed: 0.015 },
    { name: 'Earth', size: 1, distance: 10, color: 0x0000ff, speed: 0.01 },
    { name: 'Mars', size: 0.5, distance: 13, color: 0xff0000, speed: 0.008 },
    { name: 'Jupiter', size: 2.2, distance: 18, color: 0xffd700, speed: 0.005 },
    { name: 'Saturn', size: 1.8, distance: 22, color: 0xffd700, speed: 0.004 },
    { name: 'Uranus', size: 1.5, distance: 26, color: 0x00ffff, speed: 0.003 },
    { name: 'Neptune', size: 1.4, distance: 29, color: 0x0000ff, speed: 0.002 }
];

// Create planets and orbits
const planetMeshes = planets.map(planet => {
    // Planet mesh
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planet.distance;
    scene.add(mesh);

    // Orbital path
    const orbitGeometry = new THREE.RingGeometry(
        planet.distance - 0.1,
        planet.distance + 0.1,
        64
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    return { ...planet, mesh, angle: Math.random() * Math.PI * 2 };
});

// Camera positioning
camera.position.set(0, 20, 50);

// Interaction controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('wheel', handleMouseWheel);

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
    };

    camera.position.x += deltaMove.x * 0.01;
    camera.position.y -= deltaMove.y * 0.01;

    previousMousePosition = { x: e.offsetX, y: e.offsetY };
}

function handleMouseWheel(e) {
    camera.position.z += e.deltaY * 0.01;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    planetMeshes.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
        planet.mesh.rotation.y += 0.01;
    });

    sun.rotation.y += 0.001;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
