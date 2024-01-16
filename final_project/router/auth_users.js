const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regdUsersRouter = express.Router();

let users = [];

const isValid = (username) => {
  let userWithSameUsername = users.find((user) => user.username === username);
  return !!userWithSameUsername;
};

const doesExist = (username) => {
  let userWithSameUsername = users.find((user) => user.username === username);
  return !!userWithSameUsername;
};

const authenticatedUser = (username, password) => {
  let validatedUser = users.find((user) => user.username === username && user.password === password);
  return !!validatedUser;
};

// Only registered users can login
// Only registered users can login
regdUsersRouter.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  } else if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  } else {
    const accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in." });
  }
});



// Add a book review
// Add or modify a book review
regdUsersRouter.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const review = req.body.review; // string
  const isbn = req.params.isbn;
  if (!review) {
    res.status(400).json({ message: "Review is empty!" });
  } else {
    books[isbn].reviews[user] = review;
    res.status(200).json({ message: "Book review updated." });
  }
});

regdUsersRouter.delete("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    res.status(400).json({ message: "invalid ISBN." });
  } else if (!books[isbn].reviews[user]) {
    res
      .status(400)
      .json({ message: `${user} hasn't submitted a review for this book.` });
  } else {
    delete books[isbn].reviews[user];
    res.status(200).json({ message: "Book review deleted." });
  }
});


module.exports = {
  authenticated: regdUsersRouter,
  isValid: isValid,
  doesExist: doesExist,
  users: users
};
