const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema({
    title: String,
    content: String,
});

const BookSchema = new mongoose.Schema({
    bookTitle: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
    description: { type: String },
    tags: [String],
    categories: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    chapters: [ChapterSchema],
});

module.exports = mongoose.model("Book", BookSchema);