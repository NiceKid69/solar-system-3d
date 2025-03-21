import * as THREE from 'https://cdn.skypack.dev/three@0.137.5';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarSystem') });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 0, 0);
scene.add(light);

// Planets and orbital rings data
const planetsData = [
    { name: "Mercury", radius: 0.5, orbitRadius: 5, color: 0x888888 },
    { name: "Venus", radius: 0.8, orbitRadius: 7, color: 0xffa500 },
    { name: "Earth", radius: 1, orbitRadius: 10, color: 0x0000ff },
    { name: "Mars", radius: 0.7, orbitRadius: 12, color: 0xff0000 },
    { name: "Jupiter", radius: 2, orbitRadius: 16, color: 0xffff00 },
    { name: "Saturn", radius: 1.8, orbitRadius: 20, color: 0xffd700 },
    { name: "Uranus", radius: 1.5, orbitRadius: 24, color: 0x00ffff },
    { name: "Neptune", radius: 1.3, orbitRadius: 28, color: 0x0000ff },
];
const asteroidBelts = [
    { innerRadius: 14, outerRadius: 15 },
    { innerRadius: 30, outerRadius: 32 }
];

// Create planets and orbital rings
planetsData.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planet.orbitRadius;
    mesh.name = planet.name;
    scene.add(mesh);

    const ringGeometry = new THREE.RingGeometry(planet.orbitRadius - 0.1, planet.orbitRadius + 0.1, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
});

// Asteroid belts
asteroidBelts.forEach((belt) => {
    const beltGeometry = new THREE.RingGeometry(belt.innerRadius, belt.outerRadius, 64);
    const beltMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const beltMesh = new THREE.Mesh(beltGeometry, beltMaterial);
    beltMesh.rotation.x = Math.PI / 2;
    scene.add(beltMesh);
});

// Controls
const speedControl = document.getElementById('speed');
let rotationSpeed = parseFloat(speedControl.value);
speedControl.addEventListener('input', () => {
    rotationSpeed = parseFloat(speedControl.value);
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach((child) => {
        if (child.name) {
            child.rotation.y += rotationSpeed * 0.001;
        }
    });
    renderer.render(scene, camera);
}
animate();

// Responsive and mobile-friendly
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
