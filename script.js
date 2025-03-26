// Scene setu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('book-container').appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Materials
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
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const page = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness),
        pageMaterial
    );
    page.position.z = i * pageThickness - (pageCount * pageThickness / 2);
    scene.add(page);
    pages.push(page);
}

// Animation
let isFlipping = false;
let currentPage = 0;

window.addEventListener('click', () => {
    if (isFlipping || currentPage >= pages.length) return;

    isFlipping = true;
    const targetRotation = pages[currentPage].rotation.y + Math.PI;

    function flipPage() {
        pages[currentPage].rotation.y += 0.1;
        if (pages[currentPage].rotation.y >= targetRotation) {
            pages[currentPage].rotation.y = targetRotation;
            currentPage++;
            isFlipping = false;
        } else {
            requestAnimationFrame(flipPage);
        }
        renderer.render(scene, camera);
    }
    flipPage();
});

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
