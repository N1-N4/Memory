import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#f0e8d9');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const bookGroup = new THREE.Group();
scene.add(bookGroup);

const bookWidth = 4;
const bookHeight = 6;
const pageCount = 12;
const pageThickness = 0.02;
const coverThickness = 0.1;
const totalBookThickness = pageCount * pageThickness + coverThickness * 2;

const coverMaterial = new THREE.MeshBasicMaterial({ color: '#faebd7' });

const leftCover = new THREE.Mesh(new THREE.BoxGeometry(coverThickness, bookHeight, bookWidth), coverMaterial);
leftCover.position.set(-coverThickness / 2, 0, 0);
bookGroup.add(leftCover);

const rightCover = new THREE.Mesh(new THREE.BoxGeometry(coverThickness, bookHeight, bookWidth), coverMaterial);
rightCover.position.set(pageCount * pageThickness + coverThickness / 2, 0, 0);
bookGroup.add(rightCover);

const pages = [];

function generateMonthlyDates(startDate, count) {
    const dates = [];
    let current = new Date(startDate);
    for (let i = 0; i < count; i++) {
        dates.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }
    return dates;
}

const startDate = new Date("2024-04-09");
const dates = generateMonthlyDates(startDate, pageCount);
const urls = dates.map((d, i) => `https://example.com/month-${i + 1}`);

bookGroup.rotation.y = Math.PI;

const loader = new THREE.TextureLoader();

function createPageTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f8e8c8';
    ctx.fillRect(0, 0, 40, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = '40px serif';
    ctx.fillText(text, 100, 100);

    return new THREE.CanvasTexture(canvas);
}

pages.length = 0;

for (let i = 0; i < pageCount; i++) {
    const pagePivot = new THREE.Group();
    bookGroup.add(pagePivot);

    const dateText = dates[i].toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const texture = createPageTexture(dateText);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

    const pageGeometry = new THREE.PlaneGeometry(bookWidth, bookHeight, 20, 1);
    pageGeometry.translate(bookWidth / 2, 0, 0);

    const page = new THREE.Mesh(pageGeometry, material);
    pagePivot.add(page);

    const zOffset = i * (pageThickness + 0.005);
    pagePivot.position.set(-bookWidth / 2, 0, totalBookThickness / 2 - zOffset - pageThickness);
    pages.push(pagePivot);

    page.userData.url = urls[i];
}

renderer.domElement.addEventListener('pointerdown', (event) => {
    const mouse = new THREE.Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(pages.map(p => p.children[0]));
    if (intersects.length > 0) {
        const clickedPage = intersects[0].object;
        if (clickedPage.userData.url) {
            window.open(clickedPage.userData.url, '_blank');
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
