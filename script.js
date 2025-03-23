// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('book-container').appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.6);
pointLight.position.set(10, 20, 10);
scene.add(pointLight);

// Book dimensions
const coverWidth = 12;
const coverHeight = 16;
const coverThickness = 0.5;
const pageWidth = 11.8;
const pageHeight = 15.8;
const pageThickness = 0.02;
const pageCount = 50;

// Materials
const coverMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 }); // Dark red cover
const pageMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFF0 });  // Ivory pages

// Book cover
const coverGeometry = new THREE.BoxGeometry(coverWidth, coverHeight, coverThickness);
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
const backCover = new THREE.Mesh(coverGeometry, coverMaterial);

frontCover.position.z = pageCount * pageThickness / 2 + coverThickness / 2;
backCover.position.z = -pageCount * pageThickness / 2 - coverThickness / 2;

scene.add(frontCover);
scene.add(backCover);

// Pages
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const pageGeometry = new THREE.BoxGeometry(pageWidth, pageHeight, pageThickness);
    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    page.position.z = (i - pageCount / 2) * pageThickness;
    pages.push(page);
    scene.add(page);
}

// Camera position for perspective
camera.position.set(15, 10, 25);
camera.lookAt(0, 0, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
