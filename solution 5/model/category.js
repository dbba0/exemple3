import { db } from '../db/db.js';

/**
 * Retourne les catégories d'un livre.
 * @param {string} isbn Le numéro ISBN du livre duquel on veut les catégories.
 */
export async function getCategoriesByISBN(isbn) {
    const categoriesData = await db.all(
        `SELECT c.name 
        FROM category c
        LEFT JOIN book_category bc ON c.id_category = bc.id_category
        WHERE bc.isbn = ?`,
        [isbn]
    );
    
    // On mets chaque nom d'auteur directement dans le tableau
    const categories = [];
    for(let category of categoriesData) {
        categories.push(category.name);
    }

    // Autre façon de faire:
    // const categories = categoriesData.map((category) => category.name);

    return categories;
}

/**
 * Recherche l'identifiant d'une catégorie. Si la catégorie n'existe pas, on 
 * la crée et on retourne l'identifiant de cette nouvelle catégorie.
 * @param {string} name Le nom de la catégory à rechercher ou à ajouter.
 * @returns L'identifiant de la catégorie.
 */
export async function getOrAddCategory(name) {
    // On cherche si la catégory existe
    const category = await db.get(
        `SELECT id_category from category where name = ?`, 
        [name]
    );

    if(category) {
        return category.id_category;
    }

    // Si la catégory n'existe pas, on crée la nouvelle catégory
    const result = await db.run(
        `INSERT INTO category(name) VALUES(?)`, 
        [name]
    );

    return result.lastID;
}
