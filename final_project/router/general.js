const express = require('express');
const books = require("./booksdb.js");
const publicUsersRouter = express.Router();
const axios = require('axios');
let users = require("./auth_users.js").users;

const getAllBooks = () => {
  return books;
};

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

// Register a new user
publicUsersRouter.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Missing username or password" });
  } else if (doesExist(username)) {
    return res.status(404).json({ message: "user already exists." });
  } else {
    users.push({ username: username, password: password });
    return res
      .status(200)
      .json({ message: "User successfully registered.  Please login." });
  }
});



// Get the book list available in the shop
publicUsersRouter.get('/', async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN
publicUsersRouter.get("/isbn/:isbn", async (req, res) => {
  const targetISBN = req.params.isbn;
  const targetBook = books[targetISBN];

  if (!targetBook) {
    return res.status(404).json({ message: "ISBN not found." });
  } else {
    return res.status(200).json(targetBook);
  }
});


// Get book details based on author
publicUsersRouter.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    return res.status(200).json({ books: booksByAuthor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all books based on title
publicUsersRouter.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json({ books: booksByTitle });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book review
publicUsersRouter.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews || {};
    const response = {
      book: {
        author: book.author,
        title: book.title,
        reviews: reviews,
      }
    };
    return res.status(200).json(response);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// Additional functions

const getBookByISBN = (isbn) => {
  const filteredIsbn = Object.values(books).filter((book) => book.isbn === isbn);
  return Promise.resolve(filteredIsbn);
};

const getBooksByAuthor = (author) => {
  const filteredAuthor = Object.values(books).filter((book) => book.author === author);
  return Promise.resolve(filteredAuthor);
};

const getBooksByTitle = (title) => {
  const filteredTitle = Object.values(books).filter((book) => book.title.includes(title));
  return Promise.resolve(filteredTitle);
};

const getBookReview = (isbn) => {
  const book = books[isbn];
  if (book) {
    return Promise.resolve(book);
  } else {
    return Promise.reject({ message: "Book not found" });
  }
};

module.exports = {
  general: publicUsersRouter
};
