// Grab the container and match its size
const container = document.getElementById('book-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
camera.position.set(0, 5, 18);
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
const totalBookThickness = pageCount * pageThickness;

// Front cover
const frontCoverPivot = new THREE.Group();
bookGroup.add(frontCoverPivot);
const frontCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
frontCoverGeometry.translate((bookWidth + 0.2) / 2, 0, 0);
const frontCover = new THREE.Mesh(frontCoverGeometry, coverMaterial);
frontCoverPivot.add(frontCover);
frontCoverPivot.position.set(-bookWidth / 2, 0, totalBookThickness / 2 + coverThickness / 2 + 0.01);

// Back cover
const backCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
backCoverGeometry.translate((bookWidth + 0.2) / 2, 0, 0);
const backCover = new THREE.Mesh(backCoverGeometry, coverMaterial);
backCover.position.set(-bookWidth / 2, 0, -totalBookThickness / 2 - coverThickness / 2 - 0.01);
bookGroup.add(backCover);

// Date data
const dateLinks = [];
for (let i = 0; i < pageCount; i++) {
    const date = new Date(2024, 3 + i, 9);
    const text = `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`;
    const url = `https://example.com/page${i + 1}`; // Replace with real URLs
    dateLinks.push({ text, url });
}

// Font loader + Pages with text
const pages = [];
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {

    for (let i = 0; i < pageCount; i++) {
        const pagePivot = new THREE.Group();
        bookGroup.add(pagePivot);

        // Create page geometry
        const pageGeometry = new THREE.PlaneGeometry(bookWidth, bookHeight, 20, 1);
        pageGeometry.translate(bookWidth / 2, 0, 0);
        const page = new THREE.Mesh(pageGeometry, pageMaterial);
        pagePivot.add(page);

        // Create text mesh
        const textGeo = new THREE.TextGeometry(dateLinks[i].text, {
            font: font,
            size: 0.5,
            height: 0.05,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeo, textMaterial);
        textMesh.position.set(bookWidth * 0.5 - 1.5, -0.5, 0.01);
        textMesh.userData = { url: dateLinks[i].url };
        pagePivot.add(textMesh);

        // Position in z-stack
        const zOffset = i * (pageThickness + 0.005);
        pagePivot.position.set(-bookWidth / 2, 0, zOffset);

        pages.push(pagePivot);
    }
});

// Flip logic
let isFlipping = false;
let currentPage = 0;
let coverOpened = false;

window.addEventListener('click', (event) => {
    if (isFlipping) return;

    // Raycast for clickable text
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0 && intersects[0].object.userData.url) {
        window.open(intersects[0].object.userData.url, '_blank');
        return;
    }

    // Flip cover or page
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
        flipPage();
    }
});

function flipPage() {
    const page = pages[currentPage];
    const mesh = page.children[0];
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const vertexCount = position.count;
    const maxRotation = Math.PI;
    const step = 0.05;

    page.rotation.y -= step;
    const progress = THREE.MathUtils.clamp((page.rotation.y + maxRotation) / maxRotation, 0, 1);

    for (let i = 0; i < vertexCount; i++) {
        const x = position.getX(i);
        const normalizedX = x / bookWidth;
        const curve = Math.sin(normalizedX * Math.PI) * 0.5 * progress;
        position.setZ(i, curve);
    }
    position.needsUpdate = true;
    renderer.render(scene, camera);

    if (page.rotation.y <= -maxRotation) {
        page.rotation.y = -maxRotation;

        for (let i = 0; i < vertexCount; i++) {
            const x = position.getX(i);
            const normalizedX = x / bookWidth;
            const curve = Math.sin(normalizedX * Math.PI) * 0.1;
            position.setZ(i, curve);
        }
        position.needsUpdate = true;

        const flippedZOffset = -(pageCount - currentPage - 1) * (pageThickness + 0.005);
        page.position.set(-bookWidth / 2, 0, flippedZOffset);
        page.rotation.y = -Math.PI;
        page.rotation.z = (currentPage % 2 === 0 ? 1 : -1) * currentPage * 0.002;

        currentPage++;
        isFlipping = false;
    } else {
        requestAnimationFrame(() => flipPage());
    }
}

// Resize
window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
});

// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
