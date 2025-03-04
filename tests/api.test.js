const request = require("supertest");
const app = require("../server"); // Ensure this exports the app instance

describe("API Tests", () => {
    it("should fetch all books", async () => {
        const response = await request(app).get("/books");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should save a new book", async () => {
        const newBook = {
            bookTitle: "Test Book",
            chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }]
        };
        const response = await request(app).post("/books").send(newBook);
        expect(response.status).toBe(201);
        expect(response.body.book.bookTitle).toBe("Test Book");
    });
});
