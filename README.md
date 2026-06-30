# 🔗 Custom URL Shortener

A lightweight, fast, and fully functional URL shortener built from scratch. 

This project uses core Node.js modules to handle server routing, file serving, and database management. It demonstrates a strong understanding of fundamental backend concepts, clean naming conventions, and asynchronous JavaScript.

## ✨ Features

* **Custom Link Generation:** Automatically generates unique 5-character short codes for any provided URL.
* **Smart Redirection:** Quickly looks up short codes and redirects users to their original destinations.
* **Static File Serving:** Serves HTML and image files directly using the native Node.js File System (`fs`) module.
* **Local Database:** Uses SQLite for fast, lightweight data storage without needing a separate database server.
* **Zero-Dependency Routing:** Handles all API routes and error handling using the native `http` module.

## 🛠️ Tech Stack

* **Language:** JavaScript (ES Modules)
* **Backend:** Node.js (Core `http`, `fs`, `path`, and `url` modules)
* **Database:** SQLite (`sqlite3` package)

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Make sure you have Node.js installed on your computer. 

### 2. Installation
Clone this project to your local machine, then install the required database package:

```bash
npm install sqlite3