const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection (Using MongoDB Atlas)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["author", "admin"], default: "author" }
});
const User = mongoose.model("User", UserSchema);

// Book Schema
const BookSchema = new mongoose.Schema({
    bookTitle: String,
    author: String,
    description: String,
    tags: [String],
    status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "draft" }
});
const Book = mongoose.model("Book", BookSchema);

// Register
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role: "author" });
        await user.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login successful", token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Save Book (Draft)
app.post("/books/save", authenticate, async (req, res) => {
    try {
        const { bookTitle, description, tags } = req.body;

        if (!bookTitle || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newBook = new Book({ 
            bookTitle, 
            author: req.user.email,  
            description, 
            tags, 
            status: "draft" 
        });

        await newBook.save();
        res.status(201).json({ message: "Book saved successfully!", book: newBook });
    } catch (err) {
        res.status(500).json({ message: "Error saving book", error: err.message });
    }
});

// Submit Book for Approval
app.put("/books/submit/:id", authenticate, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (req.user.email !== book.author) {
            return res.status(403).json({ message: "Unauthorized to submit this book" });
        }

        if (book.status !== "draft") {
            return res.status(400).json({ message: "Only draft books can be submitted" });
        }

        book.status = "pending"; 
        await book.save();

        res.json({ message: "Book submitted for approval!", book });
    } catch (err) {
        res.status(500).json({ message: "Error submitting book", error: err.message });
    }
});

// Fetch My Books
app.get("/my-books", authenticate, async (req, res) => {
    try {
        const books = await Book.find({ author: req.user.email });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// Fetch Approved Books (Public)
app.get("/books", async (req, res) => {
    try {
        const books = await Book.find({ status: "approved" });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// Fetch Pending Books (Admin)
app.get("/pending-books", authenticate, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const books = await Book.find({ status: "pending" });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// Approve or Reject Books (Admin)
app.put("/books/:id/status", authenticate, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ message: `Book ${status} successfully!`, book: updatedBook });
    } catch (err) {
        res.status(500).json({ message: "Error updating book status", error: err.message });
    }
});

const PORT = process.env.PORT || 5520;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
