document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Menu toggle functionality
    const menu = document.querySelector('#menu-icon');
    const navlist = document.querySelector('.navlist');

    if (menu && navlist) {
        menu.onclick = () => {
            menu.classList.toggle('bx-x');
            navlist.classList.toggle('open');
            console.log("Menu toggled");
        };
    } else {
        console.error("Menu or navlist element not found");
    }

    // Country selection and redirect functionality
    const goButton = document.getElementById("go-button");
    const countryDropdown = document.getElementById("country-dropdown");

    if (goButton && countryDropdown) {
        goButton.addEventListener("click", () => {
            const selectedCountry = countryDropdown.value;
            if (selectedCountry) {
                console.log(`Redirecting to: /${selectedCountry}.html`);
                window.location.href = `/${selectedCountry}.html`;
            } else {
                alert("Please select a country first!");
            }
        });
    } else {
        console.error("Go button or country dropdown element not found");
    }

    // Variables for image upload, editing, and cropping
    const uploadBtn = document.getElementById('uploadBtn');
    const picture = document.getElementById('picture');
    const frame = document.getElementById('frame');
    const editor = document.getElementById('editor');
    const cropBtn = document.getElementById('cropBtn');

    if (!uploadBtn || !picture || !frame || !editor || !cropBtn) {
        console.error("One or more image-related elements not found");
        return;
    }

    console.log("Image-related elements found");

    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isDragging = false;

    // Set initial frame image
    frame.style.backgroundImage = "url('frame0001.png')";

    // Upload functionality
    uploadBtn.addEventListener('click', () => {
        console.log("Upload button clicked");
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log("File selected");
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        const maxDimension = 540;
                        const scaleFactor = Math.min(
                            maxDimension / img.width,
                            maxDimension / img.height,
                            1
                        );
                        picture.style.width = `${img.width * scaleFactor}px`;
                        picture.style.height = `${img.height * scaleFactor}px`;
                        picture.src = reader.result;
                        resetImagePosition();
                        toggleSections();
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
        });

        input.click();
    });

    // Reset image position and scale
    function resetImagePosition() {
        scale = 1;
        posX = 0;
        posY = 0;
        picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        console.log("Image position reset");
    }

    // Toggle visibility of sections
    function toggleSections() {
        document.querySelector('.section-static').style.display = 'none';
        document.querySelector('.section-static1').style.display = 'none';
        document.querySelector('.section-edit').style.display = 'flex';
        console.log("Sections toggled");
    }

    // Zoom and drag functionality
    editor.addEventListener('wheel', (e) => {
        if (e.target === editor || e.target === picture) {
            e.preventDefault();
            const zoomSpeed = 0.1;

            // Calculate zoom scale
            const newScale = scale + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed);
            const clampedScale = Math.max(0.5, Math.min(newScale, 3));
            const scaleRatio = clampedScale / scale;

            // Get image bounds and calculate relative mouse position
            const rect = picture.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Adjust position to zoom towards cursor
            posX = mouseX - (mouseX - posX) * scaleRatio;
            posY = mouseY - (mouseY - posY) * scaleRatio;

            scale = clampedScale;
            picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        }
    }, { passive: false });

    // Touch events for mobile pinch-to-zoom
    let initialDistance = 0;
    let initialScale = 1;

    editor.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            initialScale = scale;
        }
    });

    editor.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const newDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            const newScale = initialScale * (newDistance / initialDistance);
            scale = Math.max(0.5, Math.min(newScale, 3));

            picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        }
    }, { passive: false });

    editor.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
    });

    picture.addEventListener('mousedown', (e) => {
        isDragging = true;
        const startX = e.clientX - posX;
        const startY = e.clientY - posY;
        picture.style.cursor = 'grabbing';

        const onMouseMove = (moveEvent) => {
            if (isDragging) {
                posX = moveEvent.clientX - startX;
                posY = moveEvent.clientY - startY;
                picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            picture.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Crop functionality
    cropBtn.addEventListener('click', () => {
        if (!picture.src || picture.src === "") {
            alert("Failed to crop the image. Please check the source or try again.");
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = picture.src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const editorRect = editor.getBoundingClientRect();
            const pictureRect = picture.getBoundingClientRect();

            canvas.width = editorRect.width;
            canvas.height = editorRect.height;

            const scaleFactorX = img.naturalWidth / pictureRect.width;
            const scaleFactorY = img.naturalHeight / pictureRect.height;

            const offsetX = (editorRect.left - pictureRect.left) * scaleFactorX;
            const offsetY = (editorRect.top - pictureRect.top) * scaleFactorY;

            ctx.drawImage(
                img,
                offsetX,
                offsetY,
                editorRect.width * scaleFactorX,
                editorRect.height * scaleFactorY,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const croppedImage = canvas.toDataURL();
            localStorage.setItem('croppedImage', croppedImage);

            const path = window.location.pathname;
            const countryName = path.substring(path.lastIndexOf('/') + 1).split('.')[0];
            window.location.href = `done.html?country=${encodeURIComponent(countryName)}`;
        };
    });
});
