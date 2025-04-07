// Grab the container and match its size
const container = document.getElementById('book-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
camera.position.set(10, 6, 14); // adjusted to better view closed book
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(containerWidth, containerHeight);
container.appendChild(renderer.domElement);

// Lighting
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

// Covers
const totalBookThickness = pageCount * pageThickness;

// Front cover
const frontCoverPivot = new THREE.Group();
bookGroup.add(frontCoverPivot);

const frontCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
frontCoverGeometry.translate((bookWidth + 0.2) / 2, 0, 0); // pivot on left
const frontCover = new THREE.Mesh(frontCoverGeometry, coverMaterial);
frontCoverPivot.add(frontCover);
frontCoverPivot.position.set(-bookWidth / 2, 0, totalBookThickness / 2 + coverThickness / 2 + 0.01); // slightly above pages

// Back cover
const backCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
backCoverGeometry.translate((bookWidth + 0.2) / 2, 0, 0); // match pivot style
const backCover = new THREE.Mesh(backCoverGeometry, coverMaterial);
backCover.position.set(-bookWidth / 2, 0, -totalBookThickness / 2 - coverThickness / 2 - 0.01);
bookGroup.add(backCover);

// Pages
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const pagePivot = new THREE.Group();
    bookGroup.add(pagePivot);

    const pageGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness);
    pageGeometry.translate(bookWidth / 2, 0, 0); // pivot at spine (left)

    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    pagePivot.add(page);

    const zOffset = i * (pageThickness + 0.005); // stack slightly forward
    pagePivot.position.set(-bookWidth / 2, 0, zOffset);

    pages.push(pagePivot);
}

// Center the book
bookGroup.position.set(0, 0, 0);

// Flip logic
let isFlipping = false;
let currentPage = 0;
let coverOpened = false;

window.addEventListener('click', () => {
    if (isFlipping) return;

    if (!coverOpened) {
        isFlipping = true;
        const targetRotation = Math.PI;

        function openCover() {
            frontCoverPivot.rotation.y -= 0.05;
            if (frontCoverPivot.rotation.y <= -targetRotation) {
                frontCoverPivot.rotation.y = -targetRotation;
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
        const targetRotation = page.rotation.y - Math.PI;

        function flipPage() {
            page.rotation.y -= 0.1;
            if (page.rotation.y <= targetRotation) {
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

// Resize handler — resizes with CSS container
window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
