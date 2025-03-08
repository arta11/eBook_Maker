const API_URL = "http://localhost:5520";  // Local backend API

// Register User
async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Failed to register. Please try again.");
    }
}

// Login User
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        alert("Login successful!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Failed to log in. Please check your credentials.");
    }
}

// Save Book as Draft
async function saveBook(bookTitle, description, tags) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/books/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ bookTitle, description, tags }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        alert("Book saved as draft!");
    } catch (error) {
        console.error("Error saving book:", error);
        alert("Failed to save book.");
    }
}

// Submit Book for Approval
async function submitBook(bookId) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/books/submit/${bookId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        alert("Book submitted for approval!");
    } catch (error) {
        console.error("Error submitting book:", error);
        alert("Failed to submit book.");
    }
}

// Fetch User's Books
async function fetchMyBooks() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/my-books`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        const books = await response.json();
        if (!response.ok) throw new Error(books.message);

        document.getElementById("my-books").innerHTML = books.map(book =>
            `<li>${book.bookTitle} - <strong>${book.status}</strong></li>`
        ).join("");
    } catch (error) {
        console.error("Error fetching books:", error);
        alert("Failed to load your books.");
    }
}

// Fetch Approved Books (Public)
async function fetchApprovedBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        if (!response.ok) throw new Error(books.message);

        document.getElementById("approved-books").innerHTML = books.map(book =>
            `<li>${book.bookTitle} by ${book.author}</li>`
        ).join("");
    } catch (error) {
        console.error("Error fetching books:", error);
        alert("Failed to load books.");
    }
}

// Fetch Pending Books (Admin)
async function fetchPendingBooks() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/pending-books`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        const books = await response.json();
        if (!response.ok) throw new Error(books.message);

        document.getElementById("pending-books").innerHTML = books.map(book =>
            `<li>${book.bookTitle} 
                <button onclick="approveBook('${book._id}')">Approve</button>
                <button onclick="rejectBook('${book._id}')">Reject</button>
            </li>`
        ).join("");
    } catch (error) {
        console.error("Error fetching pending books:", error);
        alert("Failed to load pending books.");
    }
}

// Approve or Reject Book (Admin)
async function updateBookStatus(bookId, status) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/books/${bookId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        alert(`Book ${status} successfully!`);
        fetchPendingBooks();
    } catch (error) {
        console.error(`Error updating book status to ${status}:`, error);
        alert(`Failed to ${status} book.`);
    }
}

// Approve Book (Admin)
function approveBook(bookId) {
    updateBookStatus(bookId, "approved");
}

// Reject Book (Admin)
function rejectBook(bookId) {
    updateBookStatus(bookId, "rejected");
}

// Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out!");
    window.location.href = "login.html";
}
