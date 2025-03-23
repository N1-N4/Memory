// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('book-container').appendChild(renderer.domElement);

// Lighting
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

// Book covers
const coverGeometry = new THREE.BoxGeometry(coverWidth, coverHeight, coverThickness);
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
frontCover.position.set(coverWidth / 2, 0, 0);
backCover.position.set(-coverWidth / 2, 0, 0);
scene.add(frontCover);
scene.add(backCover);

// Pages group
const pagesGroup = new THREE.Group();
for (let i = 0; i < pageCount; i++) {
    const pageGeometry = new THREE.BoxGeometry(pageWidth, pageHeight, pageThickness);
    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    page.position.set(0, 0, (i - pageCount / 2) * pageThickness);
    pagesGroup.add(page);
}
pagesGroup.position.x = coverThickness / 2;
scene.add(pagesGroup);

// Camera setup
camera.position.set(20, 10, 30);
camera.lookAt(0, 0, 0);

// Animation state
let isCoverOpen = false;
let flippingPage = 0;
let pageFlipProgress = 0;
let flipSpeed = 0.1;
let flipping = false;

// Handle clicks
window.addEventListener('click', () => {
    if (!isCoverOpen) {
        isCoverOpen = true;
    } else if (flippingPage < pageCount) {
        flipping = true;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Open cover on first click
    if (isCoverOpen && frontCover.rotation.y > -Math.PI / 2) {
        frontCover.rotation.y -= 0.05;
    }

    // Page flipping
    if (flipping) {
        const page = pagesGroup.children[flippingPage];
        if (pageFlipProgress < Math.PI) {
            page.rotation.y = -pageFlipProgress;
            pageFlipProgress += flipSpeed;
        } else {
            pageFlipProgress = 0;
            flippingPage++;
            flipping = false;
        }
    }

    renderer.render(scene, camera);
}
animate();
