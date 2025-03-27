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

// Materials
const coverMaterial = new THREE.MeshPhongMaterial({ color: 0xFF69B4 });  // Hot Pink
const pageMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });   // White

const coverThickness = 0.2;
const pageThickness = 0.02;
const bookWidth = 8.5;
const bookHeight = 11;
const pageCount = 12;

// Create front cover pivot group
const frontCoverGroup = new THREE.Group();  // PIVOT POINT HERE: This group will control rotation
scene.add(frontCoverGroup);  // Add group to scene

// Create front cover
const coverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);

// Offset cover inside the group so it rotates from the **far left edge**
frontCover.position.set((bookWidth + 0.2) / 2, 0, pageCount * pageThickness / 2 + coverThickness);  // Moves fully right
frontCoverGroup.add(frontCover);  // Add cover to group

// Position the group at the **far left Y-axis**
frontCoverGroup.position.set(-bookWidth, 0, 0);  // PIVOT POINT HERE: Now at the far-left edge

// Back cover (no pivot needed since it doesn’t rotate)
const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
backCover.position.set(-bookWidth / 2, 0, -pageCount * pageThickness / 2 - coverThickness / 2);
scene.add(backCover);

// Pages with pivot groups
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const pageGroup = new THREE.Group();  // PIVOT POINT HERE: Each page gets a pivot group
    scene.add(pageGroup);  // Add group to scene

    const page = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness),
        pageMaterial
    );

    // Offset page inside the group so it rotates from the **far left edge**
    page.position.set(bookWidth / 2, 0, i * pageThickness - (pageCount * pageThickness / 2));  // Moves fully right
    pageGroup.add(page);  // Add page to group

    // Position the group at the **far left Y-axis**
    pageGroup.position.set(-bookWidth, 0, 0);  // PIVOT POINT HERE: Now at the far-left edge

    pages.push(pageGroup);  // Store group instead of individual page
}

// Flip logic
let isFlipping = false;
let currentPage = 0;
let coverOpened = false;

// Open cover animation
window.addEventListener('click', () => {
    if (isFlipping) return;

    if (!coverOpened) {
        // Open the front cover first
        isFlipping = true;
        let targetRotation = Math.PI / 2;

        function openCover() {
            frontCoverGroup.rotation.y += 0.05;  // Rotate the group, not the cover itself
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
    } else if (currentPage < pages.length) {
        // Flip pages after the cover is opened
        isFlipping = true;
        let targetRotation = pages[currentPage].rotation.y - Math.PI;  // Rotate pages from pivot

        function flipPage() {
            pages[currentPage].rotation.y -= 0.1;  // Rotate page group, not individual page
            if (pages[currentPage].rotation.y <= targetRotation) {
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
