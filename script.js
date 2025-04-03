// Scene setup
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
light.intensity = 2;

// Materials
const coverMaterial = new THREE.MeshBasicMaterial({ color: 0xffc0cb, side: THREE.DoubleSide }); // Pink
const pageMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // White

const coverThickness = 0.2;
const pageThickness = 0.02;
const bookWidth = 6;
const bookHeight = 8;
const pageCount = 12;

// Covers (with correct pivot)
const coverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);

// FRONT COVER
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
const frontCoverGroup = new THREE.Group();
frontCover.position.x = -bookWidth / 2; // Move so left edge is at pivot
frontCoverGroup.add(frontCover);
frontCoverGroup.position.set(0, 0, pageCount * pageThickness / 2 + coverThickness / 2);
scene.add(frontCoverGroup);

// BACK COVER (No need to rotate, so stays normal)
const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
backCover.position.set(0, 0, -pageCount * pageThickness / 2 - coverThickness / 2);
scene.add(backCover);

// Pages (each with correct pivot)
const pages = [];
const pageGroups = [];

for (let i = 0; i < pageCount; i++) {
    const page = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness),
        pageMaterial
    );

    // Create a group to shift the pivot
    const pageGroup = new THREE.Group();
    page.position.x = -bookWidth / 2; // Move so left edge is at pivot
    pageGroup.add(page);

    // Position the page correctly inside the book
    pageGroup.position.set(0, 0, i * pageThickness - (pageCount * pageThickness / 2));
    scene.add(pageGroup);

    pages.push(page);
    pageGroups.push(pageGroup); // Store the group, since we will rotate it
}

// Flip logic
let isFlipping = false;
let currentPage = 0;
let coverOpened = false;

window.addEventListener('click', () => {
    if (isFlipping) return;

    if (!coverOpened) {
        // Open the front cover first
        isFlipping = true;
        let targetRotation = Math.PI / 2;
        
        function openCover() {
            frontCoverGroup.rotation.y += 0.05;
            if (frontCoverGroup.rotation.y >= targetRotation) {
                frontCoverGroup.rotation.y = targetRotation;
                coverOpened = true;
                isFlipping = false;
            } else {
                requestAnimationFrame(openCover);
            }
            renderer.render(scene, camera);
        }
        openCover();
    } else if (currentPage < pageGroups.length) {
        // Flip pages after the cover is opened
        isFlipping = true;
        let targetRotation = pageGroups[currentPage].rotation.y + Math.PI;

        function flipPage() {
            pageGroups[currentPage].rotation.y -= 0.1;
            if (pageGroups[currentPage].rotation.y <= targetRotation) {
                pageGroups[currentPage].rotation.y = targetRotation;
                currentPage++;
                isFlipping = false;
            } else {
                requestAnimationFrame(flipPage);
            }
            renderer.render(scene, camera);
        }
        flipPage();
    }
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
