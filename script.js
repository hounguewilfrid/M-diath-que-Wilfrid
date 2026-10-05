/* =========================================
   VARIABLES
========================================= */

const photoInput =
    document.getElementById("photoInput");

const choosePhotoButton =
    document.getElementById("choosePhotoButton");

const gallery =
    document.getElementById("gallery");

const emptyGallery =
    document.getElementById("emptyGallery");

const photoCount =
    document.getElementById("photoCount");

const uploadBox =
    document.getElementById("uploadBox");

const albumSelect =
    document.getElementById("albumSelect");

const adminButton =
    document.getElementById("adminButton");

const adminModal =
    document.getElementById("adminModal");

const closeModal =
    document.getElementById("closeModal");

const adminDemo =
    document.getElementById("adminDemo");

const searchInput =
    document.getElementById("searchInput");

const galleryTitle =
    document.getElementById("galleryTitle");

const showAllButton =
    document.getElementById("showAllButton");


/* =========================================
   VARIABLES DE TRAVAIL
========================================= */

let photos = [];

let adminMode = false;

let selectedAlbum = "Tous";

let currentPhotoIndex = 0;


/* =========================================
   CHARGEMENT DES PHOTOS
========================================= */

function loadPhotos() {

    const saved =
        localStorage.getItem(
            "wilfrid_media_photos"
        );

    if (saved) {

        try {

            photos = JSON.parse(saved);

        } catch (error) {

            photos = [];

        }

    }

    renderGallery();

    updateAlbumCounts();
}


/* =========================================
   SAUVEGARDE
========================================= */

function savePhotos() {

    localStorage.setItem(
        "wilfrid_media_photos",
        JSON.stringify(photos)
    );
}


/* =========================================
   OUVRIR LE SÉLECTEUR DE PHOTOS
========================================= */

choosePhotoButton.addEventListener(
    "click",
    function () {

        photoInput.click();

    }
);


/* =========================================
   SÉLECTION DE PHOTOS
========================================= */

photoInput.addEventListener(
    "change",
    function () {

        addPhotos(this.files);

    }
);


/* =========================================
   GLISSER / DÉPOSER
========================================= */

uploadBox.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadBox.classList.add("dragover");

    }
);


uploadBox.addEventListener(
    "dragleave",
    function () {

        uploadBox.classList.remove("dragover");

    }
);


uploadBox.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        uploadBox.classList.remove("dragover");

        addPhotos(event.dataTransfer.files);

    }
);


/* =========================================
   AJOUTER DES PHOTOS
========================================= */

function addPhotos(files) {

    const imageFiles =
        Array.from(files).filter(
            file =>
                file.type.startsWith("image/")
        );


    if (imageFiles.length === 0) {

        alert(
            "Veuillez sélectionner des images."
        );

        return;
    }


    const album =
        albumSelect.value;


    imageFiles.forEach(
        function (file) {

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const photo = {

                        id:
                            Date.now() +
                            Math.random(),

                        name:
                            file.name,

                        date:
                            new Date()
                                .toLocaleDateString(
                                    "fr-FR"
                                ),

                        album:
                            album,

                        image:
                            event.target.result

                    };


                    photos.unshift(photo);


                    savePhotos();

                    renderGallery();

                    updateAlbumCounts();

                };


            reader.readAsDataURL(file);

        }
    );


    photoInput.value = "";

}


/* =========================================
   AFFICHER LA GALERIE
========================================= */

function renderGallery() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let filteredPhotos =
        photos.filter(
            function (photo) {

                const matchesAlbum =
                    selectedAlbum === "Tous" ||
                    photo.album === selectedAlbum;


                const matchesSearch =
                    photo.name
                        .toLowerCase()
                        .includes(search);


                return (
                    matchesAlbum &&
                    matchesSearch
                );

            }
        );


    gallery.innerHTML = "";


    /* TITRE */

    if (selectedAlbum === "Tous") {

        galleryTitle.textContent =
            "Toutes les photos";

    } else {

        galleryTitle.textContent =
            selectedAlbum;

    }


    /* AUCUNE PHOTO */

    if (filteredPhotos.length === 0) {

        emptyGallery.style.display =
            "block";

    } else {

        emptyGallery.style.display =
            "none";


        filteredPhotos.forEach(
            function (photo) {

                const card =
                    document.createElement("div");


                card.className =
                    "photo-card";


                card.innerHTML = `

                    <img
                        src="${photo.image}"
                        alt="${photo.name}"
                        onclick="openPhoto(${photo.id})"
                    >

                    <div class="photo-info">

                        <strong>
                            ${escapeHtml(photo.name)}
                        </strong>

                        <span>
                            ${photo.date}
                        </span>

                        <span class="photo-album">
                            📁 ${escapeHtml(photo.album)}
                        </span>

                        <div>

                            <a
                                href="${photo.image}"
                                download="${escapeHtml(photo.name)}"
                                class="download-button">

                                ⬇ Télécharger

                            </a>


                            <button
                                class="delete-button"
                                onclick="deletePhoto(${photo.id})">

                                🗑 Supprimer

                            </button>

                        </div>

                    </div>

                `;


                gallery.appendChild(card);

            }
        );

    }


    photoCount.textContent =
        photos.length;

}


/* =========================================
   ÉVITER LES PROBLÈMES AVEC LES NOMS
========================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================
   COMPTER LES PHOTOS PAR ALBUM
========================================= */

function updateAlbumCounts() {

    const albums = [
        "Travaux de recherche",
        "Terrain",
        "Thèse",
        "Photos personnelles"
    ];


    albums.forEach(
        function (album) {

            const count =
                photos.filter(
                    photo =>
                        photo.album === album
                ).length;


            const element =
                document.querySelector(
                    `[data-count-album="${album}"]`
                );


            if (element) {

                element.textContent =
                    count +
                    (count <= 1
                        ? " photo"
                        : " photos");

            }

        }
    );

}


/* =========================================
   CLIQUER SUR UN ALBUM
========================================= */

document
    .querySelectorAll(".album-card")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    selectedAlbum =
                        this.dataset.album;

                    renderGallery();

                    document
                        .getElementById("galerie")
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        }
    );


/* =========================================
   TOUTES LES PHOTOS
========================================= */

showAllButton.addEventListener(
    "click",
    function () {

        selectedAlbum = "Tous";

        renderGallery();

        document
            .getElementById("galerie")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================
   RECHERCHE
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            renderGallery();

        }
    );

}


/* =========================================
   SUPPRESSION
========================================= */

function deletePhoto(id) {

    if (!adminMode) {

        alert(
            "Accès administrateur requis."
        );

        return;
    }


    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cette photo ?"
        );


    if (!confirmation) {

        return;

    }


    photos =
        photos.filter(
            photo =>
                photo.id !== id
        );


    savePhotos();

    renderGallery();

    updateAlbumCounts();

}


/* =========================================
   ADMINISTRATION
========================================= */

adminButton.addEventListener(
    "click",
    function () {

        adminModal.style.display =
            "flex";

    }
);


closeModal.addEventListener(
    "click",
    function () {

        adminModal.style.display =
            "none";

    }
);


adminDemo.addEventListener(
    "click",
    function () {

        adminMode = true;

        document.body.classList.add(
            "admin-mode"
        );

        adminModal.style.display =
            "none";

        adminButton.textContent =
            "🔓 Mode administrateur";

        alert(
            "Mode administrateur activé. Ceci est uniquement une démonstration."
        );

    }
);


window.addEventListener(
    "click",
    function (event) {

        if (
            event.target === adminModal
        ) {

            adminModal.style.display =
                "none";

        }

    }
);


/* =========================================
   VISIONNEUSE
========================================= */

function openPhoto(id) {

    const index =
        photos.findIndex(
            photo =>
                photo.id === id
        );


    if (index === -1) {

        return;

    }


    currentPhotoIndex = index;

    showCurrentPhoto();


    document
        .getElementById("photoModal")
        .style.display = "flex";

}


function showCurrentPhoto() {

    if (photos.length === 0) {

        return;

    }


    const photo =
        photos[currentPhotoIndex];


    const modalImage =
        document.getElementById(
            "modalImage"
        );


    const modalDownload =
        document.getElementById(
            "modalDownload"
        );


    const photoPosition =
        document.getElementById(
            "photoPosition"
        );


    modalImage.src =
        photo.image;


    modalImage.alt =
        photo.name;


    modalDownload.href =
        photo.image;


    modalDownload.download =
        photo.name;


    photoPosition.textContent =
        `${currentPhotoIndex + 1} / ${photos.length}`;

}


/* =========================================
   PHOTO SUIVANTE
========================================= */

function nextPhoto() {

    if (photos.length === 0) {

        return;

    }


    currentPhotoIndex++;


    if (
        currentPhotoIndex >=
        photos.length
    ) {

        currentPhotoIndex = 0;

    }


    showCurrentPhoto();

}


/* =========================================
   PHOTO PRÉCÉDENTE
========================================= */

function previousPhoto() {

    if (photos.length === 0) {

        return;

    }


    currentPhotoIndex--;


    if (currentPhotoIndex < 0) {

        currentPhotoIndex =
            photos.length - 1;

    }


    showCurrentPhoto();

}


/* =========================================
   FERMER LA PHOTO
========================================= */

function closePhoto() {

    document
        .getElementById("photoModal")
        .style.display = "none";


    document
        .getElementById("modalImage")
        .src = "";

}


/* =========================================
   CLAVIER
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const modal =
            document.getElementById(
                "photoModal"
            );


        if (
            modal.style.display !== "flex"
        ) {

            return;

        }


        if (
            event.key === "ArrowRight"
        ) {

            nextPhoto();

        }


        if (
            event.key === "ArrowLeft"
        ) {

            previousPhoto();

        }


        if (
            event.key === "Escape"
        ) {

            closePhoto();

        }

    }
);


/* =========================================
   TOUCH / GLISSEMENT SUR TÉLÉPHONE
========================================= */

let touchStartX = 0;

let touchEndX = 0;


const photoModal =
    document.getElementById(
        "photoModal"
    );


photoModal.addEventListener(
    "touchstart",
    function (event) {

        touchStartX =
            event.changedTouches[0].screenX;

    }
);


photoModal.addEventListener(
    "touchend",
    function (event) {

        touchEndX =
            event.changedTouches[0].screenX;


        const difference =
            touchStartX - touchEndX;


        if (Math.abs(difference) < 50) {

            return;

        }


        if (difference > 0) {

            nextPhoto();

        } else {

            previousPhoto();

        }

    }
);


/* =========================================
   DÉMARRAGE
========================================= */

loadPhotos();
