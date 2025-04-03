// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 5, 12);  // Adjusted camera for better view
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('book-container').appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(10, 20, 10);
scene.add(pointLight);

// Materials
const coverMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0cb, side: THREE.DoubleSide }); // Pink
const pageMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // White

// Book dimensions
const coverThickness = 0.2;
const pageThickness = 0.02;
const bookWidth = 6;
const bookHeight = 8;
const pageCount = 12;

// Book group - keeps all parts together
const bookGroup = new THREE.Group();
scene.add(bookGroup);

// Create a pivot group for the front cover
const frontCoverPivot = new THREE.Group();
bookGroup.add(frontCoverPivot);

// Covers
const coverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);

// Move the front cover so the pivot is at the spine
frontCover.position.set(bookWidth / 2, 0, 0);
frontCoverPivot.add(frontCover); // Add cover to pivot

const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
backCover.position.set(-bookWidth / 2, 0, 0); // Back cover fixed at spine
bookGroup.add(backCover);

// Pages
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const pagePivot = new THREE.Group(); // Each page gets a pivot
    bookGroup.add(pagePivot);

    const page = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness),
        pageMaterial
    );
    
    // Move page so it pivots from the spine
    page.position.set(bookWidth / 2, 0, 0);
    pagePivot.position.set(-bookWidth / 2, 0, i * pageThickness - (pageCount * pageThickness / 2));
    
    pagePivot.add(page);
    pages.push(pagePivot);
}

// Center book slightly forward for better visibility
bookGroup.position.set(0, 0, 1);

// Flip logic - ensure pivot is correct for page flipping
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
            frontCoverPivot.rotation.y += 0.05; // Rotate the pivot group
            if (frontCoverPivot.rotation.y >= targetRotation) {
                frontCoverPivot.rotation.y = targetRotation;
                coverOpened = true;
                isFlipping = false;
            } else {
                requestAnimationFrame(openCover);
            }
            renderer.render(scene, camera);
        }
        openCover();
    } else if (currentPage < pages.length) {
        // Flip pages after the cover is opened
        isFlipping = true;
        let targetRotation = pages[currentPage].rotation.y + Math.PI / 2;

        function flipPage() {
            pages[currentPage].rotation.y += 0.1;  // Rotate around pivot
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
