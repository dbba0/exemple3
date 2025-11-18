import { db } from '../db/db.js';
import { getAuthorsByISBN, getOrAddAuthor } from './author.js';
import { getCategoriesByISBN, getOrAddCategory } from './category.js';

/**
 * Retourne la liste de tous les titres de livres avec leur ISBN dans notre bibliothèque.
 * @returns Une liste de titre de livre avec leur ISBN.
 */
export async function getAllISBNAndTitle() {
    const books = await db.all(`SELECT isbn, title FROM book;`);

    return books;
}

/**
 * Retourne un livre de notre bibliothèque en fonction de son ISBN.
 * @param {string} isbn Le numéro ISBN du livre à rechercher.
 * @returns Le livre correspondant à l'ISBN ou null si aucun livre ne correspond.
 */
export async function getBookByISBN(isbn) {
    const book = await db.get(
        `SELECT isbn, title, nb_pages, summary
        FROM book
        WHERE isbn = ?`,
        [isbn]
    );

    // On ajoute le tableau d'auteurs et de catégories au livre
    book.authors = await getAuthorsByISBN(isbn);
    book.categories = await getCategoriesByISBN(isbn);

    return book;
}

/**
 * AJoute un livre à la liste des livres de notre bibliothèque.
 * @param {object} book Un objet représentant un livre.
 */
export async function addBook(book) {
    // Ajouter le livre
    const result = await db.run(
        `INSERT INTO book(isbn, title, nb_pages, summary)
        VALUES(?, ?, ?, ?);`,
        [book.isbn, book.title, book.nbPages, book.summary]
    );

    // Ajoute tous les auteurs au livre
    addAuthors(book.isbn, book.authors);

    // Ajoute toutes les catégories au livre
    addCategories(book.isbn, book.categories);

    return result.lastID;
}

/**
 * Modifie un livre de notre bibliothèque en fonction de son ISBN. Si le livre n'existe pas, il est ajouté.
 * @param {string} isbn Le numéro ISBN du livre à modifier. 
 * @param {object} newBook Un objet représentant le livre modifié.
 */
export async function modifyBook(isbn, newBook) {
    // Supprimer le livre courant
    await deleteBook(isbn);

    // Rajouter le livre avec les nouvelles valeurs
    await addBook(newBook);
}

/**
 * Supprime un livre de notre bibliothèque en fonction de son ISBN.
 * @param {string} isbn Le numéro ISBN du livre à supprimer.
 */
export async function deleteBook(isbn) {
    await db.run(
        `DELETE FROM book_author WHERE isbn = ?`,
        [isbn]
    );

    await db.run(
        `DELETE FROM book_category WHERE isbn = ?`,
        [isbn]
    );

    await db.run(
        `DELETE FROM book WHERE isbn = ?`,
        [isbn]
    );
}

/**
 * Ajoute des auteurs à un livre.
 * @param {string} isbn ISBN du livre auquel on ajoute les auteurs.
 * @param {string[]} authors Tableau d'auteurs à ajouter à un livre.
 */
async function addAuthors(isbn, authors) {
    for(let author of authors) {
        const idAuthor = await getOrAddAuthor(author);
        await db.run(
            `INSERT INTO book_author(isbn, id_author)
            VALUES(?, ?);`,
            [isbn, idAuthor]
        );
    }
}

/**
 * Ajoute des catégories à un livre.
 * @param {string} isbn ISBN du livre auquel on ajoute les catégories.
 * @param {string[]} categories Tableau de catégories que l'on ajoute à un livre.
 */
async function addCategories(isbn, categories) {
    for(let category of categories) {
        const idCategory = await getOrAddCategory(category);
        await db.run(
            `INSERT INTO book_category(isbn, id_category)
            VALUES(?, ?);`,
            [isbn, idCategory]
        );
    }
}
