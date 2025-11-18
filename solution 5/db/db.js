import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { existsSync } from 'node:fs';

// Vérifie si le fichier de base de données est 
// nouveau (n'existe pas encore)
const IS_NEW = !existsSync(process.env.DB_FILE);

// Connexion à la base de données. Vous devez 
// spécifier le nom du fichier de base de données 
// dans le fichier .env
let db = await open({
    filename: process.env.DB_FILE,
    driver: sqlite3.Database
});

// Création de la table si elle n'existe pas, on 
// peut écrire du code SQL pour initialiser les 
// tables et données dans la fonction exec()
if(IS_NEW) {
    await db.exec(
        `PRAGMA foreign_keys = ON;
        
        CREATE TABLE book(
            isbn TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            nb_pages INTEGER NOT NULL,
            summary TEXT NOT NULL
        );
        
        CREATE TABLE author(
            id_author INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );
        
        CREATE TABLE category(
            id_category INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );
        
        CREATE TABLE book_author(
            isbn TEXT,
            id_author INTEGER,
            PRIMARY KEY(isbn, id_author),
            FOREIGN KEY(isbn) REFERENCES book(isbn),
            FOREIGN KEY(id_author) REFERENCES author(id_author)
        );
        
        CREATE TABLE book_category(
            isbn TEXT,
            id_category INTEGER,
            PRIMARY KEY(isbn, id_category),
            FOREIGN KEY(isbn) REFERENCES book(isbn),
            FOREIGN KEY(id_category) REFERENCES category(id_category)
        );
        
        INSERT INTO author(name) VALUES('J.K. Rowling');
        INSERT INTO author(name) VALUES('Andrzej Sapkowski');
        
        INSERT INTO category(name) VALUES('fantastique');
        INSERT INTO category(name) VALUES('junior');
        INSERT INTO category(name) VALUES('action');
        INSERT INTO category(name) VALUES('adulte');
        
        INSERT INTO book(isbn, title, nb_pages, summary)
        VALUES(
            '978-2070518425', 
            'Harry Potter à l''école des sorciers', 
            308, 
            'Sauvé de la négligence scandaleuse de sa tante et de son oncle, un jeune garçon avec un grand destin prouve sa valeur tout en fréquentant l''école des sorciers et des sorcières de Poudlard'
        );
        INSERT INTO book(isbn, title, nb_pages, summary)
        VALUES(
            '978-0316452960', 
            'The Witcher - The Tower of Swallows', 
            464, 
            'The world is at war and the prophesied savior is nowhere to be found. The Witcher, Geralt of Rivia, races to find her in the fourth novel of Andrzej Sapkowski''s groundbreaking epic fantasy series that inspired the hit Netflix show and the blockbuster video games.'
        );
        
        INSERT INTO book_author(isbn, id_author)
        VALUES('978-2070518425', 1);
        INSERT INTO book_author(isbn, id_author)
        VALUES('978-0316452960', 2);
        
        INSERT INTO book_category(isbn, id_category)
        VALUES('978-2070518425', 1);
        INSERT INTO book_category(isbn, id_category)
        VALUES('978-2070518425', 2);
        INSERT INTO book_category(isbn, id_category)
        VALUES('978-0316452960', 1);
        INSERT INTO book_category(isbn, id_category)
        VALUES('978-0316452960', 3);
        INSERT INTO book_category(isbn, id_category)
        VALUES('978-0316452960', 4);`
    );
}

export { db }