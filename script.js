/* ============================================================
   MÉDIATHÈQUE WILFRID HOUNGUE
   Connexion Supabase
   ============================================================ */


/* ============================================================
   CONFIGURATION SUPABASE
   ============================================================ */

const SUPABASE_URL = "https://uihuiiarigdcnitzbeoy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__QlnDUAaH2Jm8wBqz02XXg_JnfCZXqX";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* ============================================================
   VARIABLES
   ============================================================ */

const ALBUMS = [
    "Travaux de recherche",
    "Terrain",
    "Thèse",
    "Photos personnelles"
];

const ALBUM_SLUGS = {
    "Travaux de recherche": "travaux-de-recherche",
    "Terrain": "terrain",
    "Thèse": "these",
    "Photos personnelles": "photos-personnelles"
};


let allPhotos = [];
let displayedPhotos = [];

let selectedFiles = [];

let currentAlbum = null;

let currentViewerIndex = 0;

let currentUser = null;

let isAdmin = false;


/* ============================================================
   ÉLÉMENTS HTML
   ============================================================ */

const albumSelect =
    document.getElementById("albumSelect");

const photoInput =
    document.getElementById("photoInput");

const selectedFilesContainer =
    document.getElementById("selectedFiles");

const uploadButton =
    document.getElementById("uploadButton");

const uploadStatus =
    document.getElementById("uploadStatus");

const gallery =
    document.getElementById("gallery");

const loading =
    document.getElementById("loading");

const emptyGallery =
    document.getElementById("emptyGallery");

const galleryTitle =
    document.getElementById("galleryTitle");

const gallerySubtitle =
    document.getElementById("gallerySubtitle");

const searchInput =
    document.getElementById("searchInput");

const allPhotosButton =
    document.getElementById("allPhotosButton");

const adminButton =
    document.getElementById("adminButton");


/* ============================================================
   MODAL CONNEXION
   ============================================================ */

const loginModal =
    document.getElementById("loginModal");

const closeLogin =
    document.getElementById("closeLogin");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginStatus =
    document.getElementById("loginStatus");


/* ============================================================
   VISIONNEUSE
   ============================================================ */

const viewerModal =
    document.getElementById("viewerModal");

const closeViewer =
    document.getElementById("closeViewer");

const viewerImage =
    document.getElementById("viewerImage");

const viewerTitle =
    document.getElementById("viewerTitle");

const viewerAlbum =
    document.getElementById("viewerAlbum");

const downloadPhoto =
    document.getElementById("downloadPhoto");

const previousPhoto =
    document.getElementById("previousPhoto");

const nextPhoto =
    document.getElementById("nextPhoto");


/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

    configureEvents();

    await checkAuthentication();

    await loadPhotos();

});


/* ============================================================
   ÉVÉNEMENTS
   ============================================================ */

function configureEvents() {

    /* Choix de fichiers */

    photoInput.addEventListener(
        "change",
        handleFileSelection
    );


    /* Choix de l'album */

    albumSelect.addEventListener(
        "change",
        updateUploadButton
    );


    /* Envoi */

    uploadButton.addEventListener(
        "click",
        uploadPhotos
    );


    /* Recherche */

    searchInput.addEventListener(
        "input",
        filterPhotos
    );


    /* Toutes les photos */

    allPhotosButton.addEventListener(
        "click",
        () => {

            currentAlbum = null;

            document
                .querySelectorAll(".album-card")
                .forEach(card => {
                    card.classList.remove("active");
                });

            galleryTitle.textContent =
                "Toutes les photos";

            gallerySubtitle.textContent =
                "Photos disponibles dans la médiathèque.";

            renderGallery();

        }
    );


    /* Albums */

    document
        .querySelectorAll(".album-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const album =
                        card.dataset.album;

                    selectAlbum(album);

                }
            );

        });


    /* Administration */

    adminButton.addEventListener(
        "click",
        handleAdminButton
    );


    /* Connexion */

    closeLogin.addEventListener(
        "click",
        closeLoginModal
    );


    loginModal.addEventListener(
        "click",
        event => {

            if (event.target === loginModal) {
                closeLoginModal();
            }

        }
    );


    loginForm.addEventListener(
        "submit",
        handleLogin
    );


    /* Visionneuse */

    closeViewer.addEventListener(
        "click",
        closeViewerModal
    );


    viewerModal.addEventListener(
        "click",
        event => {

            if (event.target === viewerModal) {
                closeViewerModal();
            }

        }
    );


    previousPhoto.addEventListener(
        "click",
        showPreviousPhoto
    );


    nextPhoto.addEventListener(
        "click",
        showNextPhoto
    );


    /* Clavier */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}


/* ============================================================
   AUTHENTIFICATION
   ============================================================ */

async function checkAuthentication() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error) {
            currentUser = null;
            isAdmin = false;
            updateAdminInterface();
            return;
        }


        currentUser =
            data.user || null;


        if (currentUser) {

            await checkAdmin();

        } else {

            isAdmin = false;

        }


        updateAdminInterface();


    } catch (error) {

        console.error(
            "Erreur authentification :",
            error
        );

        currentUser = null;
        isAdmin = false;

        updateAdminInterface();

    }


    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            currentUser =
                session?.user || null;


            if (currentUser) {

                await checkAdmin();

            } else {

                isAdmin = false;

            }


            updateAdminInterface();

        }
    );

}


/* ============================================================
   VÉRIFICATION ADMINISTRATEUR
   ============================================================ */

async function checkAdmin() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "is_admin"
            );


        if (error) {

            console.error(
                "Erreur vérification admin :",
                error
            );

            isAdmin = false;

            return;
        }


        isAdmin = data === true;


    } catch (error) {

        console.error(
            "Erreur admin :",
            error
        );

        isAdmin = false;

    }

}


/* ============================================================
   INTERFACE ADMINISTRATEUR
   ============================================================ */

function updateAdminInterface() {

    if (isAdmin) {

        document.body.classList.add(
            "admin-mode"
        );

        adminButton.textContent =
            "🚪 Déconnexion";

    } else {

        document.body.classList.remove(
            "admin-mode"
        );

        adminButton.textContent =
            "🔐 Administration";

    }

}


/* ============================================================
   BOUTON ADMINISTRATION
   ============================================================ */

async function handleAdminButton() {

    if (isAdmin) {

        await logout();

    } else {

        openLoginModal();

    }

}


/* ============================================================
   OUVRIR CONNEXION
   ============================================================ */

function openLoginModal() {

    loginModal.classList.remove("hidden");

    loginEmail.focus();

}


/* ============================================================
   FERMER CONNEXION
   ============================================================ */

function closeLoginModal() {

    loginModal.classList.add("hidden");

    loginStatus.textContent = "";

    loginStatus.className = "status";

}


/* ============================================================
   CONNEXION ADMIN
   ============================================================ */

async function handleLogin(event) {

    event.preventDefault();


    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    if (!email || !password) {

        showStatus(
            loginStatus,
            "Veuillez remplir tous les champs.",
            "error"
        );

        return;
    }


    showStatus(
        loginStatus,
        "Connexion en cours...",
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        if (error) {

            throw error;

        }


        currentUser =
            data.user;


        await checkAdmin();


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            currentUser = null;

            throw new Error(
                "Ce compte n'a pas les droits administrateur."
            );

        }


        updateAdminInterface();


        showStatus(
            loginStatus,
            "Connexion réussie.",
            "success"
        );


        setTimeout(
            closeLoginModal,
            800
        );


        await loadPhotos();


    } catch (error) {

        console.error(
            "Erreur connexion :",
            error
        );


        showStatus(
            loginStatus,
            error.message ||
            "Impossible de se connecter.",
            "error"
        );

    }

}


/* ============================================================
   DÉCONNEXION
   ============================================================ */

async function logout() {

    try {

        await supabaseClient.auth.signOut();

        currentUser = null;

        isAdmin = false;

        updateAdminInterface();

        renderGallery();


    } catch (error) {

        console.error(
            "Erreur déconnexion :",
            error
        );

    }

}


/* ============================================================
   CHARGER LES PHOTOS
   ============================================================ */

async function loadPhotos() {

    loading.classList.remove("hidden");

    gallery.classList.add("hidden");

    emptyGallery.classList.add("hidden");


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("photos")
                .select("*")
                .order(
                    "uploaded_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;

        }


        allPhotos =
            data || [];


        updateAlbumCounts();

        renderGallery();


    } catch (error) {

        console.error(
            "Erreur chargement photos :",
            error
        );


        loading.textContent =
            "Impossible de charger les photos. Vérifiez la connexion à Supabase.";

    } finally {

        loading.classList.add("hidden");

    }

}


/* ============================================================
   URL PUBLIQUE D'UNE PHOTO
   ============================================================ */

function getPhotoUrl(storagePath) {

    const {
        data
    } =
        supabaseClient
            .storage
            .from("photos")
            .getPublicUrl(storagePath);


    return data.publicUrl;

}


/* ============================================================
   AFFICHER LES PHOTOS
   ============================================================ */

function renderGallery() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    displayedPhotos =
        allPhotos.filter(photo => {

            const matchesAlbum =
                !currentAlbum ||
                photo.album === currentAlbum;


            const matchesSearch =
                !search ||
                photo.file_name
                    .toLowerCase()
                    .includes(search) ||
                photo.album
                    .toLowerCase()
                    .includes(search);


            return (
                matchesAlbum &&
                matchesSearch
            );

        });


    gallery.innerHTML = "";


    if (displayedPhotos.length === 0) {

        gallery.classList.add("hidden");

        emptyGallery.classList.remove(
            "hidden"
        );

        return;

    }


    emptyGallery.classList.add(
        "hidden"
    );

    gallery.classList.remove(
        "hidden"
    );


    displayedPhotos.forEach(
        (photo, index) => {

            const card =
                createPhotoCard(
                    photo,
                    index
                );


            gallery.appendChild(card);

        }
    );

}


/* ============================================================
   CRÉER UNE CARTE PHOTO
   ============================================================ */

function createPhotoCard(
    photo,
    index
) {

    const card =
        document.createElement("article");

    card.className =
        "photo-card";


    const imageContainer =
        document.createElement("div");

    imageContainer.className =
        "photo-image-container";


    const image =
        document.createElement("img");

    image.className =
        "photo-image";

    image.src =
        getPhotoUrl(
            photo.storage_path
        );

    image.alt =
        photo.file_name;

    image.loading =
        "lazy";


    image.addEventListener(
        "click",
        () => {
            openViewer(index);
        }
    );


    image.addEventListener(
        "error",
        () => {

            image.alt =
                "Image indisponible";

        }
    );


    imageContainer.appendChild(
        image
    );


    if (isAdmin) {

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-button";

        deleteButton.innerHTML =
            "🗑";

        deleteButton.title =
            "Supprimer cette photo";


        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                deletePhoto(photo);

            }
        );


        imageContainer.appendChild(
            deleteButton
        );

    }


    const info =
        document.createElement("div");

    info.className =
        "photo-info";


    const name =
        document.createElement("div");

    name.className =
        "photo-name";

    name.textContent =
        photo.file_name;


    const album =
        document.createElement("div");

    album.className =
        "photo-album";

    album.textContent =
        photo.album;


    info.appendChild(name);
    info.appendChild(album);


    card.appendChild(
        imageContainer
    );

    card.appendChild(
        info
    );


    return card;

}


/* ============================================================
   SÉLECTIONNER UN ALBUM
   ============================================================ */

function selectAlbum(album) {

    currentAlbum =
        album;


    albumSelect.value =
        album;


    document
        .querySelectorAll(".album-card")
        .forEach(card => {

            card.classList.toggle(
                "active",
                card.dataset.album === album
            );

        });


    galleryTitle.textContent =
        album;


    gallerySubtitle.textContent =
        `Photos de l'album « ${album} ».`;


    renderGallery();


    document
        .querySelector(".section:last-of-type")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* ============================================================
   RECHERCHE
   ============================================================ */

function filterPhotos() {

    renderGallery();

}


/* ============================================================
   COMPTE DES PHOTOS PAR ALBUM
   ============================================================ */

function updateAlbumCounts() {

    const counts = {

        "Travaux de recherche": 0,

        "Terrain": 0,

        "Thèse": 0,

        "Photos personnelles": 0

    };


    allPhotos.forEach(
        photo => {

            if (
                counts.hasOwnProperty(
                    photo.album
                )
            ) {

                counts[photo.album]++;

            }

        }
    );


    updateCount(
        "count-recherche",
        counts["Travaux de recherche"]
    );

    updateCount(
        "count-terrain",
        counts["Terrain"]
    );

    updateCount(
        "count-these",
        counts["Thèse"]
    );

    updateCount(
        "count-personnelles",
        counts["Photos personnelles"]
    );

}


function updateCount(
    elementId,
    count
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${count} photo${count > 1 ? "s" : ""}`;

}


/* ============================================================
   SÉLECTION DES FICHIERS
   ============================================================ */

function handleFileSelection() {

    selectedFiles =
        Array.from(
            photoInput.files
        );


    renderSelectedFiles();

    updateUploadButton();

}


/* ============================================================
   AFFICHER LES FICHIERS SÉLECTIONNÉS
   ============================================================ */

function renderSelectedFiles() {

    selectedFilesContainer.innerHTML =
        "";


    if (
        selectedFiles.length === 0
    ) {

        return;

    }


    selectedFiles.forEach(
        file => {

            const row =
                document.createElement("div");

            row.className =
                "selected-file";


            const name =
                document.createElement("span");

            name.textContent =
                file.name;


            const size =
                document.createElement("span");

            size.className =
                "selected-file-size";

            size.textContent =
                formatFileSize(
                    file.size
                );


            row.appendChild(name);

            row.appendChild(size);

            selectedFilesContainer.appendChild(
                row
            );

        }
    );

}


/* ============================================================
   ACTIVATION BOUTON ENVOI
   ============================================================ */

function updateUploadButton() {

    const albumSelected =
        albumSelect.value !== "";

    const filesSelected =
        selectedFiles.length > 0;


    uploadButton.disabled =
        !albumSelected ||
        !filesSelected;

}


/* ============================================================
   UPLOAD DES PHOTOS
   ============================================================ */

async function uploadPhotos() {

    const album =
        albumSelect.value;


    if (!album) {

        showStatus(
            uploadStatus,
            "Veuillez choisir un album.",
            "error"
        );

        return;

    }


    if (
        selectedFiles.length === 0
    ) {

        showStatus(
            uploadStatus,
            "Veuillez sélectionner au moins une photo.",
            "error"
        );

        return;

    }


    const invalidFiles =
        selectedFiles.filter(
            file => {

                const validType = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                ].includes(
                    file.type
                );


                const validSize =
                    file.size <=
                    10 * 1024 * 1024;


                return (
                    !validType ||
                    !validSize
                );

            }
        );


    if (
        invalidFiles.length > 0
    ) {

        showStatus(
            uploadStatus,
            "Une ou plusieurs photos ne respectent pas les formats ou la taille maximale de 10 MB.",
            "error"
        );

        return;

    }


    uploadButton.disabled =
        true;


    showStatus(
        uploadStatus,
        "Envoi des photos en cours...",
        "info"
    );


    let successCount = 0;

    let errorCount = 0;


    for (
        const file of selectedFiles
    ) {

        try {

            const extension =
                getExtension(
                    file.name
                );


            const safeName =
                sanitizeFileName(
                    file.name
                );


            const slug =
                ALBUM_SLUGS[album];


            const uniqueId =
                crypto.randomUUID();


            const storagePath =
                `${slug}/${uniqueId}-${safeName}`;


            /* Envoi dans Storage */

            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("photos")
                    .upload(
                        storagePath,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false,
                            contentType: file.type
                        }
                    );


            if (uploadError) {

                throw uploadError;

            }


            /* Enregistrement dans la table */

            const {
                error: databaseError
            } =
                await supabaseClient
                    .from("photos")
                    .insert({
                        file_name: file.name,
                        storage_path: storagePath,
                        album: album,
                        uploaded_by:
                            currentUser
                                ? currentUser.id
                                : null
                    });


            if (databaseError) {

                /* Nettoyage du fichier si la base échoue */

                await supabaseClient
                    .storage
                    .from("photos")
                    .remove([
                        storagePath
                    ]);


                throw databaseError;

            }


            successCount++;


        } catch (error) {

            console.error(
                "Erreur upload :",
                error
            );

            errorCount++;

        }

    }


    selectedFiles = [];

    photoInput.value = "";

    renderSelectedFiles();

    updateUploadButton();


    if (
        successCount > 0 &&
        errorCount === 0
    ) {

        showStatus(
            uploadStatus,
            `${successCount} photo${successCount > 1 ? "s" : ""} envoyée${successCount > 1 ? "s" : ""} avec succès.`,
            "success"
        );

    } else if (
        successCount > 0
    ) {

        showStatus(
            uploadStatus,
            `${successCount} photo${successCount > 1 ? "s" : ""} envoyée${successCount > 1 ? "s" : ""}, mais ${errorCount} n'ont pas pu être envoyée${errorCount > 1 ? "s" : ""}.`,
            "info"
        );

    } else {

        showStatus(
            uploadStatus,
            "Aucune photo n'a pu être envoyée.",
            "error"
        );

    }


    await loadPhotos();

}


/* ============================================================
   SUPPRESSION D'UNE PHOTO
   ============================================================ */

async function deletePhoto(photo) {

    if (!isAdmin) {

        alert(
            "Vous n'avez pas les droits pour supprimer cette photo."
        );

        return;

    }


    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer la photo "${photo.file_name}" ?`
        );


    if (!confirmation) {
        return;
    }


    try {

        /* Suppression du fichier */

        const {
            error: storageError
        } =
            await supabaseClient
                .storage
                .from("photos")
                .remove([
                    photo.storage_path
                ]);


        if (storageError) {

            throw storageError;

        }


        /* Suppression de l'enregistrement */

        const {
            error: databaseError
        } =
            await supabaseClient
                .from("photos")
                .delete()
                .eq(
                    "id",
                    photo.id
                );


        if (databaseError) {

            throw databaseError;

        }


        await loadPhotos();


        alert(
            "Photo supprimée avec succès."
        );


    } catch (error) {

        console.error(
            "Erreur suppression :",
            error
        );


        alert(
            "Impossible de supprimer cette photo."
        );

    }

}


/* ============================================================
   VISIONNEUSE
   ============================================================ */

function openViewer(index) {

    if (
        !displayedPhotos.length
    ) {
        return;
    }


    currentViewerIndex =
        index;


    updateViewer();


    viewerModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


function updateViewer() {

    const photo =
        displayedPhotos[
            currentViewerIndex
        ];


    if (!photo) {
        return;
    }


    const url =
        getPhotoUrl(
            photo.storage_path
        );


    viewerImage.src =
        url;

    viewerImage.alt =
        photo.file_name;


    viewerTitle.textContent =
        photo.file_name;


    viewerAlbum.textContent =
        photo.album;


    downloadPhoto.href =
        url;


    downloadPhoto.download =
        photo.file_name;

}


/* ============================================================
   PHOTO PRÉCÉDENTE
   ============================================================ */

function showPreviousPhoto() {

    if (
        displayedPhotos.length === 0
    ) {
        return;
    }


    currentViewerIndex--;

    if (
        currentViewerIndex < 0
    ) {

        currentViewerIndex =
            displayedPhotos.length - 1;

    }


    updateViewer();

}


/* ============================================================
   PHOTO SUIVANTE
   ============================================================ */

function showNextPhoto() {

    if (
        displayedPhotos.length === 0
    ) {
        return;
    }


    currentViewerIndex++;

    if (
        currentViewerIndex >=
        displayedPhotos.length
    ) {

        currentViewerIndex = 0;

    }


    updateViewer();

}


/* ============================================================
   FERMER VISIONNEUSE
   ============================================================ */

function closeViewerModal() {

    viewerModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


/* ============================================================
   CLAVIER
   ============================================================ */

function handleKeyboard(event) {

    if (
        viewerModal.classList.contains(
            "hidden"
        )
    ) {
        return;
    }


    if (
        event.key === "Escape"
    ) {

        closeViewerModal();

    }


    if (
        event.key === "ArrowLeft"
    ) {

        showPreviousPhoto();

    }


    if (
        event.key === "ArrowRight"
    ) {

        showNextPhoto();

    }

}


/* ============================================================
   MESSAGE DE STATUT
   ============================================================ */

function showStatus(
    element,
    message,
    type
) {

    element.textContent =
        message;

    element.className =
        `status show ${type}`;

}


/* ============================================================
   TAILLE FICHIER
   ============================================================ */

function formatFileSize(
    bytes
) {

    if (bytes === 0) {
        return "0 octet";
    }


    const units = [
        "octets",
        "Ko",
        "Mo",
        "Go"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(1)
        ) +
        " " +
        units[index]
    );

}


/* ============================================================
   NETTOYAGE DU NOM DE FICHIER
   ============================================================ */

function sanitizeFileName(
    fileName
) {

    const extension =
        getExtension(
            fileName
        );


    const baseName =
        fileName
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-zA-Z0-9-_]/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .toLowerCase();


    const finalName =
        baseName ||
        "photo";


    return (
        finalName +
        (
            extension
                ? "." + extension
                : ""
        )
    );

}


/* ============================================================
   EXTENSION
   ============================================================ */

function getExtension(
    fileName
) {

    const parts =
        fileName.split(".");


    if (
        parts.length < 2
    ) {

        return "";

    }


    return parts
        .pop()
        .toLowerCase();

}
