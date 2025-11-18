import { db } from '../db/db.js';

/**
 * Retourne les auteurs d'un livre.
 * @param {string} isbn Le numéro ISBN du livre duquel on veut le ou les auteurs.
 */
export async function getAuthorsByISBN(isbn) {
    const authorsData = await db.all(
        `SELECT a.name 
        FROM author a
        LEFT JOIN book_author ba ON a.id_author = ba.id_author
        WHERE ba.isbn = ?`,
        [isbn]
    );
    
    // On mets chaque nom d'auteur directement dans le tableau
    const authors = [];
    for(let author of authorsData) {
        authors.push(author.name);
    }

    // Autre façon de faire:
    // const authors = authorsData.map((author) => author.name);

    return authors;
}

/**
 * Recherche l'identifiant d'un auteur. Si l'auteur n'existe pas, on le crée 
 * et on retourne l'identifiant de ce nouvel auteur.
 * @param {string} name Le nom de l'auteur à rechercher ou à ajouter.
 * @returns L'identifiant de l'auteur.
 */
export async function getOrAddAuthor(name) {
    // On cherche si l'auteur existe
    const author = await db.get(
        `SELECT id_author from author where name = ?`, 
        [name]
    );

    if(author) {
        return author.id_author;
    }

    // Si l'auteur n'existe pas, on crée le nouvel auteur
    const result = await db.run(
        `INSERT INTO author(name) VALUES(?)`, 
        [name]
    );

    return result.lastID;
}
