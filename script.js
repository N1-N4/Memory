// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 5, 12);
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
const coverMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0cb, side: THREE.DoubleSide });
const pageMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

// Book dimensions
const coverThickness = 0.2;
const pageThickness = 0.02;
const bookWidth = 6;
const bookHeight = 8;
const pageCount = 12;

// Book group
const bookGroup = new THREE.Group();
scene.add(bookGroup);

// Front cover with pivot
const frontCoverPivot = new THREE.Group();
bookGroup.add(frontCoverPivot);

const coverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
coverGeometry.translate((bookWidth + 0.2) / 2, 0, 0);  // Move pivot to spine
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
frontCoverPivot.add(frontCover);

// Back cover
const backCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
backCoverGeometry.translate(-(bookWidth + 0.2) / 2, 0, 0); // Pivot at spine (left)
const backCover = new THREE.Mesh(backCoverGeometry, coverMaterial);
bookGroup.add(backCover);

// Pages
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const pagePivot = new THREE.Group();
    bookGroup.add(pagePivot);

    const pageGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness);
    pageGeometry.translate(bookWidth / 2, 0, 0);  // Shift pivot to spine edge (left side)

    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    pagePivot.add(page);

    pagePivot.position.set(-bookWidth / 2, 0, i * pageThickness - (pageCount * pageThickness / 2));
    pages.push(pagePivot);
}

// Adjust book position
bookGroup.position.set(0, 0, 1);

// Flip logic
let isFlipping = false;
let currentPage = 0;
let coverOpened = false;

window.addEventListener('click', () => {
    if (isFlipping) return;

    if (!coverOpened) {
        isFlipping = true;
        const targetRotation = Math.PI / 2;

        function openCover() {
            frontCoverPivot.rotation.y += 0.05;
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
        isFlipping = true;
        const page = pages[currentPage];
        const targetRotation = page.rotation.y + Math.PI / 2;

        function flipPage() {
            page.rotation.y += 0.1;
            if (page.rotation.y >= targetRotation) {
                page.rotation.y = targetRotation;
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

// Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
