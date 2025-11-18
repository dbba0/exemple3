// Chargement du fichier de configuration
import 'dotenv/config'

// Importations générales du projet
import express, { json } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression';
import { engine } from 'express-handlebars';
import { addBook, deleteBook, getAllISBNAndTitle, getBookByISBN, modifyBook } from './model/book.js';

// Création du serveur
const app = express();

// Initialisation des engins
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Ajout des middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.static('public'));

// Programmation des routes de rendu
app.get('/', async (request, response) => {
    const books = await getAllISBNAndTitle();

    response.render('home', {
        title: 'Bibliothèque | Accueil',
        styles: ['/css/home.css'],
        scripts: ['/js/home.js'],
        books: books
    });
});

// Programmation des routes
// Route pour obtenir la liste des livres (ISBN et titre seulement)
app.get('/api/books', async (request, response) => {
    const list = await getAllISBNAndTitle();
    response.status(200).json(list);
});

// Route pour ajouter un livre
app.post('/api/book', async (request, response) => {
    await addBook(request.body);
    response.status(201).end();
});

// Route pour obtenir un livre à partir de son ISBN
app.get('/api/book', async (request, response) => {
    const book = await getBookByISBN(request.query.isbn);
    response.status(200).json(book);
});

// Route pour modifier un livre à partir de son ISBN
app.put('/api/book', async (request, response) => {
    await modifyBook(request.body.isbn, request.body.book);
    response.status(200).end();
});

// Route pour supprimer un livre à partir de son ISBN
app.delete('/api/book', async (request, response) => {
    await deleteBook(request.body.isbn);
    response.status(200).end();
});

// Démarrage du serveur
app.listen(process.env.PORT);
console.log('Serveur démarré:');
console.log('http://localhost:' + process.env.PORT);