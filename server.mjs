import express from 'express';
import cors from 'cors';
import { Low, JSONFile } from 'lowdb';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());  // To parse JSON data

// Create a JSON file-based database
const db = new Low(new JSONFile('db.json'));

// Initialize the database
async function initDb() {
    await db.read();
    db.data ||= { books: [] };  // Initialize an empty array if no data exists
    await db.write();
}

// Run initialization
initDb();

// CRUD Routes

// 1. Get all books
app.get('/api/books', async (req, res) => {
    await db.read();
    res.json(db.data.books);
});

// 2. Create a new book (fixed imageURL)
app.post('/api/books', async (req, res) => {
    const { title, author, category, isAvailable, isVerified, borrowedDays } = req.body;

    if (!title || !author || !category) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newBook = {
        id: db.data.books.length + 1, // Generate simple id
        title,
        author,
        category,
        isAvailable: isAvailable || true,
        isVerified: isVerified || null,
        borrowedDays: borrowedDays || null,
        imageURL: "https://marketplace.canva.com/EAFf0E5urqk/1/0/1003w/canva-blue-and-green-surreal-fiction-book-cover-53S3IzrNxvY.jpg", // Fixed image URL
    };

    db.data.books.push(newBook);
    await db.write();
    res.status(201).json(newBook);
});

// 3. Update a book by id (imageURL remains fixed)
app.patch('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const { isAvailable, isVerified, borrowedDays } = req.body;

    const bookIndex = db.data.books.findIndex((book) => book.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const currentBook = db.data.books[bookIndex];

    const updatedBook = {
        ...currentBook,
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isVerified !== undefined && { isVerified }),
        ...(borrowedDays !== undefined && { borrowedDays }),
        imageURL: currentBook.imageURL
    };

    db.data.books[bookIndex] = updatedBook;
    await db.write();

    res.json(updatedBook);
});


// 4. Delete a book by id
app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const bookIndex = db.data.books.findIndex((book) => book.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    db.data.books.splice(bookIndex, 1);
    await db.write();
    res.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
