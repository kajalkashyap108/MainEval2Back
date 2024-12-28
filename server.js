const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Hardcoded image URL
const imageUrl = "https://m.media-amazon.com/images/I/71ZB1BPNS22._jpg";

// Supported categories
const supportedCategories = ["Fiction", "Comedy", "Technical"];

// Path to the database file
const dbFilePath = path.join(__dirname, 'db.json');

// Helper function to read data from db.json
const readBooksFromDB = () => {
    if (!fs.existsSync(dbFilePath)) {
        return [];
    }
    const data = fs.readFileSync(dbFilePath);
    return JSON.parse(data);
};

// Helper function to write data to db.json
const writeBooksToDB = (books) => {
    fs.writeFileSync(dbFilePath, JSON.stringify(books, null, 2));
};

// Initialize books from db.json
let books = readBooksFromDB();

// Base route: /beoks/
const baseRoute = "/beoks";

// Get all books
app.get(`${baseRoute}`, (req, res) => {
    res.json(books);
});

// Add a new book
app.post(`${baseRoute}`, (req, res) => {
    const { title, category, isAvailable = true, isVerified = false } = req.body;

    // Validate category
    if (!supportedCategories.includes(category)) {
        return res.status(400).json({ error: `Category must be one of: ${supportedCategories.join(', ')}` });
    }

    // Create a new book object
    const newBook = {
        id: books.length + 1,
        title,
        category,
        isAvailable,
        isVerified,
        imageUrl
    };

    // Add the book to the list
    books.push(newBook);
    writeBooksToDB(books);
    res.status(201).json(newBook);
});

// Get a book by ID
app.get(`${baseRoute}/:id`, (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
});

// Delete a book by ID
app.delete(`${baseRoute}/:id`, (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found" });
    }

    const deletedBook = books.splice(bookIndex, 1);
    writeBooksToDB(books);
    res.json(deletedBook);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
