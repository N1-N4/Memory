// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('book-container').appendChild(renderer.domElement);

// Lighting (fixes black screen)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Softer ambient light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 20, 10);
scene.add(pointLight);

// Book structure
const coverMaterial = new THREE.MeshPhongMaterial({ color: 0x8B5E3B });
const pageMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

const coverThickness = 0.2;
const pageThickness = 0.02;
const bookWidth = 6;
const bookHeight = 8;
const pageCount = 12;

// Covers
const coverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
frontCover.position.z = pageCount * pageThickness / 2 + coverThickness / 2;
scene.add(frontCover);

const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
backCover.position.z = -pageCount * pageThickness / 2 - coverThickness / 2;
scene.add(backCover);

// Pages
for (let i = 0; i < pageCount; i++) {
    const page = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness),
        pageMaterial
    );
    page.position.z = i * pageThickness - (pageCount * pageThickness / 2);
    scene.add(page);
}

// Camera position (adjusted for better view)
camera.position.set(10, 15, 25);
camera.lookAt(0, 0, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
