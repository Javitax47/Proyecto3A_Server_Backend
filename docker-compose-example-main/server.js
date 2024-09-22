const express = require('express');
const pool = require('./db');
const port = 3000;

const app = express();
app.use(express.json());

// Crear tablas (setup)
app.get('/setup', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sensors (
                id SERIAL PRIMARY KEY,
                type VARCHAR(100),
                value FLOAT,
                timestamp TIMESTAMP,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        res.status(200).send({ message: "Successfully created users and sensors tables" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Routes
app.get('/', async (req, res) => {
    try {
        const sensorsQuery = await pool.query('SELECT * FROM sensors');
        const usersQuery = await pool.query('SELECT * FROM users');

        const responseData = {
            sensors: sensorsQuery.rows,
            users: usersQuery.rows
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


// Insertar un sensor (medición) con un userId
app.post('/', async (req, res) => {
    const { type, value, timestamp, userId } = req.body;
    try {
        // Verificar si el usuario existe antes de insertar el sensor
        const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userExists.rows.length === 0) {
            return res.status(400).send({ message: "User does not exist" });
        }

        await pool.query('INSERT INTO sensors (type, value, timestamp, user_id) VALUES ($1, $2, $3, $4)', [type, value, timestamp, userId]);
        res.status(200).send({ message: "Successfully added sensor data" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Insertar un nuevo usuario
app.post('/users', async (req, res) => {
    const { username } = req.body;
    try {
        await pool.query('INSERT INTO users (username) VALUES ($1)', [username]);
        res.status(200).send({ message: "Successfully added user" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Eliminar todas las mediciones de un usuario
app.delete('/users/:id/measurements', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM sensors WHERE user_id = $1', [id]);
        res.status(200).send({ message: "Successfully deleted measurements for user" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Resetear (eliminar todas las tablas y recrearlas)
app.delete('/reset', async (req, res) => {
    try {
        await pool.query('DROP TABLE IF EXISTS sensors');
        await pool.query('DROP TABLE IF EXISTS users');

        // Crear tablas
        await pool.query(`
            CREATE TABLE users (
                                   id SERIAL PRIMARY KEY,
                                   username VARCHAR(100) NOT NULL
            );
            CREATE TABLE sensors (
                                     id SERIAL PRIMARY KEY,
                                     type VARCHAR(100),
                                     value FLOAT,
                                     timestamp TIMESTAMP,
                                     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Insertar usuarios por defecto
        await pool.query('INSERT INTO users (username) VALUES ($1), ($2)', ['user1', 'user2']);

        // Insertar sensores por defecto
        await pool.query(`
            INSERT INTO sensors (type, value, timestamp, user_id) 
            VALUES 
            ($1, $2, $3, $4),
            ($5, $6, $7, $8)
        `, ['temperature', 25.5, '2024-09-22T12:00:00Z', 1, 'humidity', 60.0, '2024-09-22T12:00:00Z', 2]);

        res.status(200).send({ message: "Successfully reset users and sensors tables with default data" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.delete('/erase', async (req, res) => {
    try {
        await pool.query('DROP TABLE IF EXISTS sensors');
        await pool.query('DROP TABLE IF EXISTS users');
        res.status(200).send({ message: "Successfully reset users and sensors tables" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Iniciar el servidor
app.listen(port, () => console.log(`Server running on port: ${port}`));