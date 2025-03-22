
// Ensure scene has a visible background
scene.background = new THREE.Color(0xf0e6d2);

// Scenesetup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('book-container').appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Add ambient light for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Materials
const coverMaterial = new THREE.MeshPhongMaterial({ color: 0x8B5E3B });
const pageMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

// Book dimensions
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
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const page = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness),
        pageMaterial
    );
    page.position.z = i * pageThickness - (pageCount * pageThickness / 2);
    page.userData = { flipped: false };
    pages.push(page);
    scene.add(page);
}

// Camera position
camera.position.set(10, 10, 20);
camera.lookAt(0, 0, 0);

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let flipping = false;
let currentPage = 0;

// Handle click to flip pages
window.addEventListener('click', (event) => {
    if (flipping || currentPage >= pages.length) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(pages);
    if (intersects.length > 0) {
        const page = pages[currentPage];
        if (!page.userData.flipped) {
            flipping = true;
            animateFlip(page, () => {
                page.userData.flipped = true;
                currentPage++;
                flipping = false;
            });
        }
    }
});

// Page flip animation
function animateFlip(page, onComplete) {
    const targetRotation = Math.PI;
    let progress = 0;
    function flip() {
        if (progress < 1) {
            progress += 0.05;
            page.rotation.y = progress * targetRotation;
            requestAnimationFrame(flip);
        } else {
            page.rotation.y = targetRotation;
            if (onComplete) onComplete();
        }
    }
    flip();
}

// Resize handler
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
