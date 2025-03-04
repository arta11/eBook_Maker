const API_URL = "https://your-app.onrender.com/books";

let book = { title: "", author: "", description: "", tags: [], chapters: [] };

function addChapter() {
    const chapterTitle = document.getElementById("chapterTitle").value.trim();
    const chapterContent = document.getElementById("chapterContent").value.trim();

    if (!chapterTitle || !chapterContent) {
        alert("Please fill out all fields!");
        return;
    }

    book.chapters.push({ title: chapterTitle, content: chapterContent });

    document.getElementById("chapterTitle").value = "";
    document.getElementById("chapterContent").value = "";

    alert(`Chapter \"${chapterTitle}\" added!`);
}

async function saveBook() {
    const bookTitle = document.getElementById("bookTitle").value.trim();
    const description = document.getElementById("description").value.trim();
    const tags = document.getElementById("tags").value.split(",").map(tag => tag.trim());

    if (!bookTitle || !description) {
        alert("Please fill out all fields!");
        return;
    }

    const book = { bookTitle, description, tags };

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to save a book.");
            return;
        }

        const response = await fetch("https://your-app.onrender.com/books/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(book)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Book saved successfully!");
            fetchMyBooks(); // Refresh books
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        console.error("Error saving book:", err);
        alert("Failed to connect to the server.");
    }
}




async function loadBookForEdit(bookId) {
    try {
        const response = await fetch(`${API_URL}/${bookId}`);
        if (!response.ok) throw new Error("Failed to fetch book.");

        const bookData = await response.json();
        document.getElementById("bookTitle").value = bookData.bookTitle;
        document.getElementById("author").value = bookData.author;
        document.getElementById("description").value = bookData.description;
        document.getElementById("tags").value = bookData.tags.join(", ");
        document.getElementById("editBookId").value = bookData._id;

        book = { title: bookData.bookTitle, author: bookData.author, description: bookData.description, tags: bookData.tags, chapters: bookData.chapters };
    } catch (err) {
        console.error("Error loading book for edit:", err);
        alert("Failed to load book for editing.");
    }
}

async function submitBook(bookId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to submit a book.");
            return;
        }

        const response = await fetch(`https://your-app.onrender.com/books/submit/${bookId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("Book submitted for approval!");
            fetchMyBooks(); // Refresh book list
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        console.error("Error submitting book:", err);
        alert("Failed to connect to the server.");
    }
}



async function fetchMyBooks() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized. Please log in.");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch("https://your-app.onrender.com/my-books", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const books = await response.json();

        console.log("Fetched books:", books); // Debugging

        const draftContainer = document.getElementById("draft-books");
        draftContainer.innerHTML = "";

        if (!Array.isArray(books) || books.length === 0) {
            draftContainer.innerHTML = "<p>No books found.</p>";
            return;
        }

        books.forEach(book => {
            const bookElement = document.createElement("div");
            bookElement.className = "book-item";
            bookElement.innerHTML = `
                <h3>${book.bookTitle}</h3>
                <p>Description: ${book.description}</p>
                <p>Status: <strong>${book.status.toUpperCase()}</strong></p>
                ${book.status === "draft" ? `<button onclick="submitBook('${book._id}')">Submit for Approval</button>` : ""}
            `;

            draftContainer.appendChild(bookElement);
        });
    } catch (err) {
        console.error("Error fetching books:", err);
        alert("Failed to load your books.");
    }
}



// Fetch books on page load
document.addEventListener("DOMContentLoaded", fetchMyBooks);


async function editBook(bookId) {
    const bookTitle = document.getElementById("bookTitle").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!bookTitle || !description) {
        alert("Please fill out all fields!");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized. Please log in.");
            return;
        }

        const response = await fetch(`https://your-app.onrender.com/books/${bookId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ bookTitle, description })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Book updated successfully!");
            fetchBooks(); // Refresh book list
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        console.error("Error updating book:", err);
        alert("Failed to update book.");
    }
}




