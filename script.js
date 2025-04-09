// Grab the container and match its size
const container = document.getElementById('book-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

// Camera setup (front-facing)
const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);
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

// Book dimension
const coverThickness = 0.2;
const pageThickness = 0.02;
const bookWidth = 6;
const bookHeight = 8;
const pageCount = 12;

// Book group
const bookGroup = new THREE.Group();
scene.add(bookGroup);

const totalBookThickness = pageCount * pageThickness;

// Preload textures
const textureLoader = new THREE.TextureLoader();
const imagePaths = [
  'images/IMG_1800.png', 'images/IMG_1801.png', 'images/photo3.jpg', 'images/photo4.jpg',
  'images/photo5.jpg', 'images/photo6.jpg', 'images/photo7.jpg', 'images/photo8.jpg',
  'images/photo9.jpg', 'images/photo10.jpg', 'images/photo11.jpg', 'images/photo12.jpg'
];

const links = [
  'https://example.com/1', 'https://example.com/2', 'https://example.com/3', 'https://example.com/4',
  'https://example.com/5', 'https://example.com/6', 'https://example.com/7', 'https://example.com/8',
  'https://example.com/9', 'https://example.com/10', 'https://example.com/11', 'https://example.com/12'
];

// Pages
const pages = [];
const clickablePhotos = [];

for (let i = 0; i < pageCount; i++) {
  const pagePivot = new THREE.Group();
  bookGroup.add(pagePivot);

  // Base page
  const pageGeometry = new THREE.PlaneGeometry(bookWidth, bookHeight, 20, 1);
  pageGeometry.translate(bookWidth / 2, 0, 0);
  const basePage = new THREE.Mesh(pageGeometry, pageMaterial);
  pagePivot.add(basePage);

  // Load image texture
  const texture = textureLoader.load(imagePaths[i]);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Smaller photo
  const photoWidth = bookWidth * 0.6;
  const photoHeight = bookHeight * 0.6;
  const photoGeometry = new THREE.PlaneGeometry(photoWidth, photoHeight);
  const photoMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

  const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
  photoMesh.position.set(bookWidth * 0.5, 0, 0.001);
  pagePivot.add(photoMesh);

  // Optional border
  const borderMaterial = new THREE.LineBasicMaterial({ color: 0x999999 });
  const borderGeometry = new THREE.EdgesGeometry(photoGeometry);
  const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
  borderLines.position.copy(photoMesh.position);
  pagePivot.add(borderLines);

  // Position stacking
  const zOffset = i * (pageThickness + 0.005);
  pagePivot.position.set(-bookWidth / 2, 0, zOffset);

  pages.push(pagePivot);
  clickablePhotos.push({ mesh: photoMesh, url: links[i] });
}

// Back cover
const backCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
backCoverGeometry.translate((bookWidth + 0.2) / 2, 0, 0);
const backCover = new THREE.Mesh(backCoverGeometry, coverMaterial);
backCover.position.set(-bookWidth / 2, 0, -totalBookThickness / 2 - coverThickness / 2 - 0.01);
bookGroup.add(backCover);

// Front cover (moved below pages to fix stacking)
const frontCoverPivot = new THREE.Group();
bookGroup.add(frontCoverPivot);

const frontCoverGeometry = new THREE.BoxGeometry(bookWidth + 0.2, bookHeight + 0.2, coverThickness);
frontCoverGeometry.translate((bookWidth + 0.2) / 2, 0, 0);
const frontCover = new THREE.Mesh(frontCoverGeometry, coverMaterial);
frontCoverPivot.add(frontCover);
frontCoverPivot.position.set(-bookWidth / 2, 0, totalBookThickness / 2 + coverThickness / 2 + 0.01);

// Center book
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
    requestAnimationFrame(flipPage);
  }
}

// Raycaster for clickable images
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickablePhotos.map(obj => obj.mesh));

  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    const match = clickablePhotos.find(obj => obj.mesh === clicked);
    if (match) window.open(match.url, '_blank');
  }
});

// Resize handler
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
