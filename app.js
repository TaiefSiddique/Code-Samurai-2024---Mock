const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Book = require("./models");


const dbUrl = `mongodb+srv://basic-crud-revise:xOU9eXJ04o6ARABT@cluster0.nebbavw.mongodb.net/?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to database!");

    app.post('/api/books', async (req, res) => {
      try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.put('/api/books/:id', async (req, res) => {
      try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) {
          return res.status(404).json({ message: `Book with id: ${req.params.id} was not found` });
        }
        res.json(book);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.get('/api/books/:id', async (req, res) => {
      try {
        const book = await Book.findById(req.params.id);
        if (!book) {
          return res.status(404).json({ message: `Book with id: ${req.params.id} was not found` });
        }
        res.json(book);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.get('/api/books', async (req, res) => {
      try {
        const books = await Book.find().sort({ _id: 1 });
        res.json({ books });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.get('/api/books/search', async (req, res) => {
      try {
        const { title, author, genre, sort, order } = req.query;
        const searchQuery = {};

        if (title) searchQuery.title = title;
        if (author) searchQuery.author = author;
        if (genre) searchQuery.genre = genre;

        const books = await Book.find(searchQuery).sort({ [sort || '_id']: order === 'DESC' ? -1 : 1 });

        res.json({ books });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


  })
  .catch((error) => {
    console.log("Connection failed!", error);
    process.exit();
  });


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
