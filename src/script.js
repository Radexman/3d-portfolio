import * as THREE from 'three';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
	materialColor: '#ffeded',
};

gui.addColor(parameters, 'materialColor').onChange(() => {
	toonMaterial.color.set(parameters.materialColor);
	particlesMaterial.color.set(parameters.materialColor);
});

// Texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('./textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

const particleTexture = textureLoader.load('./textures/gradients/9.png');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects

// Material
const toonMaterial = new THREE.MeshToonMaterial({
	color: parameters.materialColor,
	gradientMap: gradientTexture,
	wireframe: true,
});

// Meshes
const objectsDistance = 4;

const meshOne = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), toonMaterial);
meshOne.position.y = -objectsDistance * 0;
meshOne.position.x = 2;

const meshTwo = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), toonMaterial);
meshTwo.position.y = -objectsDistance * 1;
meshTwo.position.x = -2;

const meshThree = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), toonMaterial);
meshThree.position.y = -objectsDistance * 2;
meshThree.position.x = 2;

const meshFour = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), toonMaterial);
meshFour.position.y = -objectsDistance * 3;
meshFour.position.x = -2;

const sectionMeshes = [meshOne, meshTwo, meshThree, meshFour];
scene.add(meshOne, meshTwo, meshThree, meshFour);

// Particles

// Geometry
const particlesCount = 300;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
	const i3 = i * 3;
	positions[i3 + 0] = (Math.random() - 0.5) * 10;
	positions[i3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
	positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
	color: parameters.materialColor,
	sizeAttenuation: true,
	size: 0.3,
	transparent: true,
	alphaMap: particleTexture,
	depthTest: false,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Light
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */

// Camera group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scroll
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
	scrollY = window.scrollY;

	const newSection = Math.round(scrollY / sizes.height);

	if (newSection !== currentSection) {
		currentSection = newSection;

		gsap.to(sectionMeshes[currentSection].rotation, {
			duration: 2,
			ease: 'power2.inOut',
			y: '+=3',
		});
	}
});

// Cursor
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	// Animate meshes
	for (const mesh of sectionMeshes) {
		mesh.rotation.x += deltaTime * 0.1;
		mesh.rotation.y += deltaTime * 0.12;
	}

	// Animate camera on scroll
	camera.position.y = (-scrollY / sizes.height) * objectsDistance;

	// Camera parallax animation
	const parallaxX = cursor.x * 0.5;
	const parallaxY = -cursor.y * 0.5;
	cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 4 * deltaTime;
	cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 4 * deltaTime;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
