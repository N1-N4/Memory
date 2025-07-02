// script.js

// Grab the container and match its size
const container = document.getElementById('book-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e6d2);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
camera.position.set(10, 6, 14);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(containerWidth, containerHeight);
container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(10, 20, 10);
scene.add(pointLight);

// Materials
const coverMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0cb, side: THREE.DoubleSide });
const pageMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

// Book dimensions
const coverThickness = 0.2;
const pageThickness = 0.005;
const bookWidth = 6;
const bookHeight = 8;
const pageCount = 12;

// Book group
const bookGroup = new THREE.Group();
scene.add(bookGroup);

// Front cover
const frontCoverPivot = new THREE.Group();
frontCoverPivot.position.set(-bookWidth / 2, 0, 0);

const frontCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, coverThickness);
frontCoverGeo.translate(bookWidth / 2, 0, 0);
const frontCover = new THREE.Mesh(frontCoverGeo, coverMaterial);
frontCoverPivot.add(frontCover);
bookGroup.add(frontCoverPivot);

// Back cover
const backCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, coverThickness);
backCoverGeo.translate(bookWidth / 2, 0, 0);
const backCover = new THREE.Mesh(backCoverGeo, coverMaterial);
backCover.position.set(-bookWidth / 2, 0, -pageCount * pageThickness - coverThickness);
bookGroup.add(backCover);

// Pages
const pages = [];
for (let i = 0; i < pageCount; i++) {
  const pagePivot = new THREE.Group();
  pagePivot.position.set(-bookWidth / 2, 0, -i * pageThickness);

  const pageGeo = new THREE.PlaneGeometry(bookWidth, bookHeight, 20, 1);
  pageGeo.translate(bookWidth / 2, 0, 0);

  const page = new THREE.Mesh(pageGeo, pageMaterial);
  pagePivot.add(page);
  bookGroup.add(pagePivot);
  pages.push(pagePivot);
}

// State control
let isFlipping = false;
let currentPage = 0;
let coverOpened = false;

window.addEventListener('click', () => {
  if (isFlipping) return;

  if (!coverOpened) {
    isFlipping = true;
    openCover();
  } else if (currentPage < pages.length) {
    isFlipping = true;
    flipPage(pages[currentPage]);
    currentPage++;
  }
});

function openCover() {
  const targetRotation = Math.PI;
  function animateCover() {
    frontCoverPivot.rotation.y -= 0.05;
    if (frontCoverPivot.rotation.y <= -targetRotation) {
      frontCoverPivot.rotation.y = -targetRotation;
      coverOpened = true;
      isFlipping = false;
    } else {
      requestAnimationFrame(animateCover);
    }
    renderer.render(scene, camera);
  }
  animateCover();
}

function flipPage(page) {
  const mesh = page.children[0];
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const count = pos.count;

  const maxRot = Math.PI;
  const step = 0.05;

  function animateFlip() {
    page.rotation.y -= step;
    const progress = THREE.MathUtils.clamp((page.rotation.y + maxRot) / maxRot, 0, 1);

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const nx = x / bookWidth;
      const curve = Math.sin(nx * Math.PI) * 0.5 * progress;
      pos.setZ(i, curve);
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);

    if (page.rotation.y <= -maxRot) {
      page.rotation.y = -maxRot;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const nx = x / bookWidth;
        pos.setZ(i, Math.sin(nx * Math.PI) * 0.1);
      }
      pos.needsUpdate = true;
      page.position.z = -(pageCount - currentPage - 1) * pageThickness;
      page.rotation.z = (currentPage % 2 === 0 ? 1 : -1) * currentPage * 0.001;
      isFlipping = false;
    } else {
      requestAnimationFrame(animateFlip);
    }
  }
  animateFlip();
}

// Handle window resizing
window.addEventListener('resize', () => {
  const newW = container.clientWidth;
  const newH = container.clientHeight;
  renderer.setSize(newW, newH);
  camera.aspect = newW / newH;
  camera.updateProjectionMatrix();
});

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
