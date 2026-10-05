const photoInput = document.getElementById("photoInput");
const gallery = document.getElementById("gallery");
const emptyGallery = document.getElementById("emptyGallery");
const photoCount = document.getElementById("photoCount");
const uploadBox = document.getElementById("uploadBox");
const adminButton = document.getElementById("adminButton");
const adminModal = document.getElementById("adminModal");
const closeModal = document.getElementById("closeModal");
const adminDemo = document.getElementById("adminDemo");
const searchInput = document.getElementById("searchInput");

let photos = [];
let adminMode = false;

function loadPhotos() {
    const saved = localStorage.getItem("wilfrid_media_photos");

    if (saved) {
        photos = JSON.parse(saved);
    }

    renderGallery();
}

function savePhotos() {
    localStorage.setItem(
        "wilfrid_media_photos",
        JSON.stringify(photos)
    );
}

photoInput.addEventListener("change", function () {
    addPhotos(this.files);
});

uploadBox.addEventListener("dragover", function (event) {
    event.preventDefault();
    uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", function () {
    uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", function (event) {
    event.preventDefault();

    uploadBox.classList.remove("dragover");

    addPhotos(event.dataTransfer.files);
});

function addPhotos(files) {
    const imageFiles = Array.from(files).filter(file =>
        file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
        alert("Veuillez sélectionner des images.");
        return;
    }

    imageFiles.forEach(file => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const photo = {
                id: Date.now() + Math.random(),
                name: file.name,
                date: new Date().toLocaleDateString("fr-FR"),
                image: event.target.result
            };

            photos.unshift(photo);

            savePhotos();
            renderGallery();
        };

        reader.readAsDataURL(file);
    });
}

function renderGallery() {
    const search = searchInput
        ? searchInput.value.toLowerCase()
        : "";

    const filteredPhotos = photos.filter(photo =>
        photo.name.toLowerCase().includes(search)
    );

    gallery.innerHTML = "";

    if (filteredPhotos.length === 0) {
        emptyGallery.style.display = "block";
    } else {
        emptyGallery.style.display = "none";

        filteredPhotos.forEach(photo => {
            const card = document.createElement("div");

            card.className = "photo-card";

            card.innerHTML = `
                <img src="${photo.image}" alt="${photo.name}">
                <div class="photo-info">
                    <strong>${photo.name}</strong>
                    <span>${photo.date}</span>

                    <button
                        class="delete-button"
                        onclick="deletePhoto(${photo.id})">
                        Supprimer
                    </button>
                </div>
            `;

            gallery.appendChild(card);
        });
    }

    photoCount.textContent = photos.length;
}

function deletePhoto(id) {
    if (!adminMode) {
        alert("Accès administrateur requis.");
        return;
    }

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cette photo ?"
    );

    if (!confirmation) {
        return;
    }

    photos = photos.filter(photo => photo.id !== id);

    savePhotos();
    renderGallery();
}

adminButton.addEventListener("click", function () {
    adminModal.style.display = "flex";
});

closeModal.addEventListener("click", function () {
    adminModal.style.display = "none";
});

adminDemo.addEventListener("click", function () {
    adminMode = true;

    document.body.classList.add("admin-mode");

    adminModal.style.display = "none";

    adminButton.textContent = "🔓 Mode administrateur";

    alert(
        "Mode administrateur activé. Ceci est uniquement une démonstration."
    );
});

window.addEventListener("click", function (event) {
    if (event.target === adminModal) {
        adminModal.style.display = "none";
    }
});

if (searchInput) {
    searchInput.addEventListener("input", renderGallery);
}

loadPhotos();
