const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    versionNumber: { type: Number, required: true },
    bookData: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Version", VersionSchema);
