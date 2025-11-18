// Recherche d'élément dans la page HTML
const listBooks = document.getElementById('list-books');
const formBooks = document.getElementById('form-books');

/**
 * Crée un <option> dans le <select> avec le titre et le ISBN du livre.
 * @param {string} isbn Le ISBN du livre.
 * @param {string} title Le titre du livre.
 */
function addBookClient(isbn, title) {
    const option = document.createElement('option');
    option.innerText = `(${isbn}) - ${title}`;
    option.value = isbn;
    listBooks.append(option);
}

/**
 * Détecte le changement de sélection du <select> contenant les livres.
 * @param {Event} event Évènement de changement du <select> contenant les livres.
 */
async function getBookServer(event) {
    // Si Aucun livre n'est sélectionné, on vide le formulaire
    if(!event.currentTarget.value) {
        formBooks.reset();
        return;
    }

    // Si un livre est sélectionné, on va chercher son information sur le 
    // serveur avec son ISBN.
    const response = await fetch(`/api/book?isbn=${event.currentTarget.value}`);

    // Traitement de la réponse
    if(response.ok) {
        const book = await response.json();

        // On ajoute les données du livre dans le formulaire
        formBooks.isbn.value = book.isbn;
        formBooks.title.value = book.title;
        formBooks.nbPages.value = book.nb_pages;
        formBooks.summary.value = book.summary;
        formBooks.authors.value = book.authors.join(', ');
        formBooks.categories.value = book.categories.join(', ');
    }
}

/**
 * Ajoute un livre dans la bibliothèque de livre sur le serveur.
 */
async function addBookServer() {
    // Préparation des données
    const data = {
        isbn: formBooks.isbn.value,
        title: formBooks.title.value,
        nbPages: formBooks.nbPages.value,
        summary: formBooks.summary.value,
        authors: formBooks.authors.value.split(',').map((author) => author.trim()),
        categories: formBooks.categories.value.split(',').map((category) => category.trim())
    };

    // Envoyer la requête pour supprimer un livre de la bibliothèque
    const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Traitement de la réponse
    if(response.ok) {
        // Ajoute le livre dans l'interface graphique
        addBookClient(data.isbn, data.title);
        formBooks.reset();
    }
}

/**
 * Met à jour un livre dans la bibliothèque de livre sur le serveur.
 */
async function updateBookServer() {
    // Préparation des données
    const data = {
        isbn: listBooks.value,
        book: {
            isbn: formBooks.isbn.value,
            title: formBooks.title.value,
            nbPages: formBooks.nbPages.value,
            summary: formBooks.summary.value,
            authors: formBooks.authors.value.split(',').map((author) => author.trim()),
            categories: formBooks.categories.value.split(',').map((category) => category.trim())
        }
    };

    // Envoyer la requête pour modifier un livre de la bibliothèque
    const response = await fetch('/api/book', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Traitement de la réponse
    if(response.ok) {
        // Modifier le <option> du <select> au cas où le ISBN ou le titre ait 
        // changé
        const option = listBooks.querySelector(`option[value="${data.isbn}"]`);
        option.innerText = `(${data.book.isbn}) - ${data.book.title}`;
        option.value = data.book.isbn;
        formBooks.reset();
    }
}

/**
 * Supprime un livre dans la bibliothèque de livre sur le serveur.
 */
async function deleteBookServer() {
    // Préparation des données
    const data = {
        isbn: listBooks.value
    };

    // Envoyer la requête pour supprimer un livre de la bibliothèque
    const response = await fetch('/api/book', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Traitement de la réponse
    if(response.ok) {
        // Supprimer le livre de l'interface graphique
        listBooks.querySelector(`option[value="${data.isbn}"]`).remove();
        formBooks.reset();
    }
}

/**
 * Détecte la soumission du formulaire et détermine quel bouton/opération a 
 * été choisi par l'utilisateur.
 * @param {SubmitEvent} event Évènement de soumission du formulaire.
 */
function handleSubmit(event) {
    event.preventDefault();

    if(event.submitter.name === 'add') {
        addBookServer();
    }
    else if(event.submitter.name === 'update') {
        updateBookServer();
    }
    else if(event.submitter.name === 'delete') {
        deleteBookServer();
    }
}

// Code à exécuter au démarrage de la page
// Détecter le changement de sélection de la liste déroulante
listBooks.addEventListener('change', getBookServer);

// Détecter la soumission du formulaire
formBooks.addEventListener('submit', handleSubmit);
