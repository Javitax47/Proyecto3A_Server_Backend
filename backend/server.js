/**
 * @file server.js
 * @brief API para gestionar usuarios y sensores, incluyendo funcionalidades de creación, consulta, inserción y eliminación de datos.
 *
 * Este servidor Express gestiona las tablas de usuarios y sensores, proporcionando rutas para agregar datos de sensores,
 * obtener los datos más recientes y reiniciar las tablas en una base de datos PostgreSQL.
 */

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const port = 3000;

const app = express();
app.use(cors()); ///< @brief Habilita CORS para permitir solicitudes desde diferentes dominios.
app.use(express.json()); ///< @brief Habilita el middleware para procesar JSON en las solicitudes.

// Crear tablas (setup)
/**
 * @brief Ruta para crear las tablas 'users' y 'sensors' en la base de datos si no existen.
 *
 * Esta ruta se usa para inicializar las tablas necesarias en la base de datos.
 *
 * @route GET /setup
 * @return {object} 200 - Éxito en la creación de las tablas.
 * @return {object} 500 - Error interno del servidor.
 */
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

/**
 * @brief Ruta para obtener las últimas mediciones de temperatura y ozono.
 *
 * Retorna los valores más recientes de los sensores de tipo 'temperature' y 'ozono'.
 *
 * @route GET /latest
 * @return {object} 200 - Datos de los sensores de temperatura y ozono.
 * @return {object} 500 - Error interno del servidor.
 */
app.get('/latest', async (req, res) => {
    try {
        const temperatureQuery = await pool.query(`
            SELECT * FROM sensors
            WHERE type = 'temperature'
            ORDER BY timestamp DESC
                LIMIT 1
        `);
        const ozonoQuery = await pool.query(`
            SELECT * FROM sensors
            WHERE type = 'ozono'
            ORDER BY timestamp DESC
                LIMIT 1
        `);

        const responseData = {
            temperature: temperatureQuery.rows[0] || null,
            ozono: ozonoQuery.rows[0] || null
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Routes
/**
 * @brief Ruta principal para obtener todos los sensores y usuarios.
 *
 * Devuelve una lista de todos los sensores y usuarios registrados en la base de datos.
 *
 * @route GET /
 * @return {object} 200 - Datos de todos los sensores y usuarios.
 * @return {object} 500 - Error interno del servidor.
 */
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
/**
 * @brief Ruta para insertar datos de un sensor.
 *
 * Inserta una nueva medición de sensor asociada a un usuario en la base de datos.
 *
 * @route POST /
 * @param {string} type - Tipo de sensor (ej: 'temperature', 'ozono').
 * @param {float} value - Valor de la medición.
 * @param {string} timestamp - Marca de tiempo de la medición.
 * @param {integer} userId - ID del usuario asociado.
 * @return {object} 200 - Éxito al insertar la medición del sensor.
 * @return {object} 400 - El usuario no existe.
 * @return {object} 500 - Error interno del servidor.
 */
app.post('/', async (req, res) => {
    const { type, value, timestamp, userId } = req.body;
    try {
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
/**
 * @brief Ruta para insertar un nuevo usuario.
 *
 * Crea un nuevo usuario en la tabla 'users'.
 *
 * @route POST /users
 * @param {string} username - Nombre de usuario.
 * @return {object} 200 - Éxito al agregar el usuario.
 * @return {object} 500 - Error interno del servidor.
 */
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
/**
 * @brief Ruta para eliminar todas las mediciones asociadas a un usuario.
 *
 * Borra todas las entradas en la tabla 'sensors' relacionadas con un usuario específico.
 *
 * @route DELETE /users/:id/measurements
 * @param {integer} id - ID del usuario.
 * @return {object} 200 - Éxito al eliminar las mediciones del usuario.
 * @return {object} 500 - Error interno del servidor.
 */
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
/**
 * @brief Ruta para reiniciar las tablas de la base de datos.
 *
 * Borra las tablas 'users' y 'sensors', y las recrea con datos predeterminados.
 *
 * @route DELETE /reset
 * @return {object} 200 - Éxito al reiniciar las tablas.
 * @return {object} 500 - Error interno del servidor.
 */
app.delete('/reset', async (req, res) => {
    try {
        await pool.query('DROP TABLE IF EXISTS sensors');
        await pool.query('DROP TABLE IF EXISTS users');

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

        await pool.query('INSERT INTO users (username) VALUES ($1), ($2)', ['user1', 'user2']);

        await pool.query(`
            INSERT INTO sensors (type, value, timestamp, user_id) 
            VALUES 
            ($1, $2, $3, $4),
            ($5, $6, $7, $8)
        `, ['temperature', 25.5, '2024-09-22T12:00:00Z', 1, 'ozono', 60.0, '2024-09-22T12:00:00Z', 2]);

        res.status(200).send({ message: "Successfully reset users and sensors tables with default data" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Eliminar todas las tablas
/**
 * @brief Ruta para borrar las tablas de la base de datos.
 *
 * Borra las tablas 'users' y 'sensors' si existen.
 *
 * @route DELETE /erase
 * @return {object} 200 - Éxito al eliminar las tablas.
 * @return {object} 500 - Error interno del servidor.
 */
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
if (require.main === module) {
    /**
     * @brief Inicia el servidor en el puerto 3000.
     *
     * Muestra un mensaje en la consola cuando el servidor está en funcionamiento.
     */
    app.listen(port, () => console.log(`Server running on port: ${port}`));
}

module.exports = app; // Exportar el app para usarlo en las pruebas