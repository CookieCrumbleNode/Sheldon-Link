import sqlite3 from 'sqlite3';

const { Database } = sqlite3;
const ALLOWED_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

class DatabaseService {
    constructor() {
        this.db = new Database("config/database.db");
        this.db.run(`
            CREATE TABLE IF NOT EXISTS shortened_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                short_code TEXT NOT NULL,
                original_url TEXT NOT NULL
            )`);
    }

    async createLink(originalUrl) {
        const result = await this.findOrCreateShortUrl(originalUrl);
        return result;
    }

    async getLongUrl(shortCode) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT original_url FROM shortened_urls WHERE short_code = ?";
            this.db.get(sql, [shortCode], (err, row) => {
                if (err) return reject(err);
                // Return the URL if found, otherwise null
                resolve(row ? row.original_url : null);
            });
        });
    }

    async findOrCreateShortUrl(originalUrl) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM shortened_urls WHERE original_url = ?";
            this.db.get(sql, [originalUrl], async (err, row) => {
                if (err) return reject(err);
                
                if (row) {
                    resolve("Found entry: " + row.short_code);
                } else {
                    // We must await the creation of the short link
                    const newShortCode = await this.generateShortCode();
                    
                    // Insert the new link into the DB
                    this.db.run(
                        "INSERT INTO shortened_urls (short_code, original_url) VALUES (?, ?)", 
                        [newShortCode, originalUrl]
                    );
                    resolve(newShortCode);
                }
            });
        });
    }

    async generateShortCode() {
        // Generates a 5-character random string
        let shortCode = "";
        for (let i = 0; i < 5; i++) {
            shortCode += ALLOWED_CHARACTERS.charAt(Math.floor(Math.random() * ALLOWED_CHARACTERS.length));
        }

        const isAvailable = await this.isShortCodeAvailable(shortCode);
        
        if (isAvailable) {
            return shortCode;
        } else {
            // If taken, recursively try again
            return await this.generateShortCode();
        }
    }

    // Separate check to avoid infinite loops or recursion issues
    isShortCodeAvailable(shortCode) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM shortened_urls WHERE short_code = ?";
            this.db.get(sql, [shortCode], (err, row) => {
                if (err) return reject(err);
                resolve(!row); // returns true if row is undefined (available)
            });
        });
    }
}

export default DatabaseService;