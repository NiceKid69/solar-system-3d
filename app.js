class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.controls = {
            speed: 1,
            zoom: 50,
            mouseDown: false,
            lastX: 0,
            lastY: 0
        };

        this.init();
        this.createCelestialBodies();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        const light = new THREE.PointLight(0xffffff, 1.5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));

        // Camera setup
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
    }

    createCelestialBodies() {
        // Sun
        const sun = this.createBody(2, 0xffff00);
        
        // Planets
        const planets = [
            this.createPlanet(0.4, 5, 0x808080, 0.02, 'Mercury'),
            this.createPlanet(0.9, 7, 0xffa500, 0.015, 'Venus'),
            this.createPlanet(1, 10, 0x0000ff, 0.01, 'Earth', true),
            this.createPlanet(0.5, 13, 0xff0000, 0.008, 'Mars'),
            this.createPlanet(2.2, 18, 0xffd700, 0.005, 'Jupiter'),
            this.createPlanet(1.8, 22, 0xffd700, 0.004, 'Saturn', false, 1.5, 2.5),
            this.createPlanet(1.5, 26, 0x00ffff, 0.003, 'Uranus'),
            this.createPlanet(1.4, 29, 0x0000ff, 0.002, 'Neptune')
        ];

        // Asteroid belts
        this.createAsteroidBelt(15, 20, 500);
        this.createAsteroidBelt(35, 50, 800);
    }

    createPlanet(size, distance, color, speed, name, hasMoon = false, ringInner = 0, ringOuter = 0) {
        const group = new THREE.Group();
        
        // Planet
        const planet = this.createBody(size, color);
        planet.position.x = distance;
        group.add(planet);

        // Orbital ring
        this.createOrbitalRing(distance);

        // Moon
        if(hasMoon) {
            const moon = this.createBody(0.2, 0x888888);
            moon.position.x = 2;
            planet.add(moon);
            this.createOrbitalRing(2, planet, 0x666666);
        }

        // Saturn's rings
        if(ringInner > 0) {
            const saturnRing = new THREE.Mesh(
                new THREE.RingGeometry(ringInner, ringOuter, 64),
                new THREE.MeshPhongMaterial({ 
                    color: 0xcdc9c9, 
                    side: THREE.DoubleSide 
                })
            );
            saturnRing.rotation.x = Math.PI/2;
            group.add(saturnRing);
        }

        group.userData = { speed, distance };
        return group;
    }

    createBody(size, color) {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }

    createOrbitalRing(radius, parent = this.scene, color = 0x444444) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64),
            new THREE.MeshBasicMaterial({
                color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            })
        );
        ring.rotation.x = Math.PI/2;
        parent.add(ring);
        return ring;
    }

    createAsteroidBelt(inner, outer, count) {
        const belt = new THREE.Group();
        for(let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = inner + Math.random() * (outer - inner);
            const asteroid = this.createBody(0.1, 0x8b7765);
            asteroid.position.set(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            );
            belt.add(asteroid);
        }
        this.scene.add(belt);
    }

    setupEventListeners() {
        // Mouse controls
        document.addEventListener('mousedown', (e) => {
            this.controls.mouseDown = true;
            this.controls.lastX = e.clientX;
            this.controls.lastY = e.clientY;
        });

        document.addEventListener('mouseup', () => this.controls.mouseDown = false);
        
        document.addEventListener('mousemove', (e) => {
            if(!this.controls.mouseDown) return;
            const dx = e.clientX - this.controls.lastX;
            const dy = e.clientY - this.controls.lastY;
            
            this.camera.position.x += dx * 0.01;
            this.camera.position.y -= dy * 0.01;
            this.camera.lookAt(0, 0, 0);

            this.controls.lastX = e.clientX;
            this.controls.lastY = e.clientY;
        });

        // Touch controls
        document.addEventListener('touchstart', (e) => {
            this.controls.mouseDown = true;
            this.controls.lastX = e.touches[0].clientX;
            this.controls.lastY = e.touches[0].clientY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if(!this.controls.mouseDown) return;
            const dx = e.touches[0].clientX - this.controls.lastX;
            const dy = e.touches[0].clientY - this.controls.lastY;
            
            this.camera.position.x += dx * 0.01;
            this.camera.position.y -= dy * 0.01;
            this.camera.lookAt(0, 0, 0);

            this.controls.lastX = e.touches[0].clientX;
            this.controls.lastY = e.touches[0].clientY;
        }, { passive: false });

        document.addEventListener('touchend', () => this.controls.mouseDown = false);

        // Zoom controls
        document.addEventListener('wheel', (e) => {
            this.controls.zoom = Math.min(200, Math.max(10, this.controls.zoom - e.deltaY * 0.1));
            this.camera.position.z = this.controls.zoom;
        });

        // Speed control
        document.getElementById('speed').addEventListener('input', (e) => {
            this.controls.speed = parseFloat(e.target.value);
        });

        // Reset view
        document.getElementById('reset').addEventListener('click', () => {
            this.camera.position.set(0, 30, 50);
            this.camera.lookAt(0, 0, 0);
            this.controls.zoom = 50;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta() * this.controls.speed;

        // Animate planets
        this.scene.children.forEach(child => {
            if(child.userData?.speed) {
                child.rotation.y += delta * 0.5;
                child.children[0].position.x = Math.cos(child.rotation.y) * child.userData.distance;
                child.children[0].position.z = Math.sin(child.rotation.y) * child.userData.distance;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize solar system
new SolarSystem();
