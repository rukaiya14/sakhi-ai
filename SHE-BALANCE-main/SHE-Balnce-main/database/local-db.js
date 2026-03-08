// Local SQLite Database Manager for Development
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('./db-config');

class LocalDatabase {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../database/shebalance.db');
    }

    // Initialize database
    async initialize() {
        return new Promise((resolve, reject) => {
            // Create database directory if it doesn't exist
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Error opening database:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    // Create all tables from schema
    async createTables