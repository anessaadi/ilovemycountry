const uploadBtn = document.getElementById('uploadBtn');
const picture = document.getElementById('picture');
const frame = document.getElementById('frame');
const editor = document.getElementById('editor');
const cropBtn = document.getElementById('cropBtn');

let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;
let lastTouchDistance = 0;

// Set initial frame image
frame.style.backgroundImage = "url('frame0001.png')"; // Replace with your frame URL

// Upload button event
uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    // Calculate scaling factor
                    const maxDimension = 540;
                    const scaleFactor = Math.min(
                        maxDimension / img.width,
                        maxDimension / img.height,
                        1 // Ensure scaling does not upscale smaller images
                    );

                    // Apply scaling to the image element
                    const scaledWidth = img.width * scaleFactor;
                    const scaledHeight = img.height * scaleFactor;

                    picture.style.width = `${scaledWidth}px`;
                    picture.style.height = `${scaledHeight}px`;
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

// GitHub picture fetch and display
function fetchGitHubPicture() {
    const username = document.getElementById("github-username").value.trim();

    if (username) {
        const githubApiUrl = `https://api.github.com/users/${username}`;

        fetch(githubApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.avatar_url) {
                    const img = new Image();
                    img.crossOrigin = "anonymous"; // Allow CORS if necessary

                    img.onload = () => {
                        // Calculate scaling factor
                        const maxDimension = 540;
                        const scaleFactor = Math.min(
                            maxDimension / img.width,
                            maxDimension / img.height,
                            1 // Ensure scaling does not upscale smaller images
                        );

                        // Apply scaling to the image element
                        const scaledWidth = img.width * scaleFactor;
                        const scaledHeight = img.height * scaleFactor;

                        // Set the image source and scaling styles
                        picture.style.width = `${scaledWidth}px`;
                        picture.style.height = `${scaledHeight}px`;
                        picture.src = img.src;

                        resetImagePosition();
                        toggleSections();
                    };

                    img.onerror = () => {
                        alert("Failed to load the image. CORS issue detected.");
                    };

                    // Directly set the image source to the avatar URL
                    img.src = data.avatar_url;
                } else {
                    alert('GitHub user not found or no profile picture available.');
                }
            })
            .catch(error => {
                alert('An error occurred while fetching the GitHub profile picture.');
                console.error(error);
            });
    } else {
        alert("Please enter a GitHub username.");
    }
}

// Reset image position and scale
function resetImagePosition() {
    scale = 1;
    posX = 0;
    posY = 0;
    picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Toggle between static and edit sections
function toggleSections() {
    document.querySelector('.section-static').style.display = 'none';
    document.querySelector('.section-static1').style.display = 'none';
    document.querySelector('.section-edit').style.display = 'flex';
}

// Zoom functionality with mouse wheel
editor.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const zoomSpeed = 0.1;
        scale += e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        scale = Math.max(0.5, Math.min(scale, 3));
        picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }
});

// Touch-based zoom functionality
editor.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        lastTouchDistance = getDistanceBetweenTouches(e);
    }
}, { passive: true });

editor.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        const newTouchDistance = getDistanceBetweenTouches(e);
        if (lastTouchDistance) {
            const delta = newTouchDistance - lastTouchDistance;
            const zoomSpeed = 0.005;
            scale += delta * zoomSpeed;
            scale = Math.max(0.5, Math.min(scale, 3));
            picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        }
        lastTouchDistance = newTouchDistance;
    }
}, { passive: true });

// Function to calculate distance between two touch points
function getDistanceBetweenTouches(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Dragging functionality for repositioning the image
picture.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    picture.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    picture.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    picture.style.cursor = 'grab';
});

// Function to open the popup
document.querySelector('.use-button').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'flex';
});

// Function to close the popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Cropping functionality
cropBtn.addEventListener('click', () => {
    if (!picture.src || picture.src === "") {
        alert("Failed to crop the image. Please check the source or try again.");
        return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // Set cross-origin to anonymous for external images
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

        // Extract the country name from the file name (without the extension)
        const path = window.location.pathname;
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        const countryName = fileName.split('.')[0]; // Get the part before the .html extension

        // Remove ".html" if it exists in the countryName
        const cleanCountryName = countryName.replace('.html', '');

        // Modify the URL with the country name as a query parameter
        window.location.href = `done.html?country=${encodeURIComponent(cleanCountryName)}`;
    };

    img.onerror = () => {
        alert("Failed to load the image. Please check the source or try again.");
    };
});
