// Page flipping logic with more pronounced curvature at the end and proper stackin
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
            const page = pages[currentPage];
            const mesh = page.children[0]; // the actual page mesh
            const geometry = mesh.geometry;
            const position = geometry.attributes.position;
            const vertexCount = position.count;

            const maxRotation = Math.PI; // flip 180 degrees
            const step = 0.05;

            // Animate rotation
            page.rotation.y -= step;

            // Get flip progress: 1 when starting, 0 when done
            const progress = THREE.MathUtils.clamp((page.rotation.y + maxRotation) / maxRotation, 0, 1);

            // Apply bending curvature and ensure pages stay stacked
            for (let i = 0; i < vertexCount; i++) {
                const x = position.getX(i);
                const normalizedX = x / bookWidth; // 0 to 1 across the width
                const curve = Math.sin(normalizedX * Math.PI) * 0.5 * progress; 
                const additionalBend = Math.pow(1 - normalizedX, 2) * progress * 0.5; // Larger bending at the end
                position.setZ(i, curve + additionalBend);
            }

            position.needsUpdate = true;

            renderer.render(scene, camera);

            // Done flipping
            if (page.rotation.y <= -maxRotation) {
                page.rotation.y = -maxRotation;

                // Reset curvature at the end of the flip
                for (let i = 0; i < vertexCount; i++) {
                    position.setZ(i, 0);
                }
                position.needsUpdate = true;

                currentPage++;
                isFlipping = false;
            } else {
                requestAnimationFrame(flipPage);
            }
        }
        flipPage();
    }
});

// Adjust page stacking effect
const pages = [];
for (let i = 0; i < pageCount; i++) {
    const pagePivot = new THREE.Group();
    bookGroup.add(pagePivot);

    const pageGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, pageThickness);
    pageGeometry.translate(bookWidth / 2, 0, 0); // pivot at spine (left)

    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    pagePivot.add(page);

    // Apply a slight offset for stacking effect (correct zOffset)
    const zOffset = i * (pageThickness + 0.01); // stack slightly forward, with more space between pages
    const yOffset = Math.sin(i * 0.1) * 0.2; // small height variation to give a sense of volume
    pagePivot.position.set(-bookWidth / 2, yOffset, zOffset);

    pages.push(pagePivot);
}

// Center the book group (ensure it's aligned in the center of the screen)
bookGroup.position.set(0, 0, 0);

// Ensure that pages are placed correctly in front of each other with proper spacing
