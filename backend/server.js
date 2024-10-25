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

/**
 * @brief Crea las tablas 'sensores', 'mediciones', 'usuarios', 'actividad' y 'alertas' en la base de datos.
 *
 * Esta ruta es utilizada para inicializar las tablas necesarias en la base de datos según el nuevo diseño.
 *
 * @route GET /setup
 * @return {object} 200 - Éxito en la creación de las tablas.
 * @return {object} 500 - Error interno del servidor.
 */
app.get('/setup', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tipos (
                id SERIAL PRIMARY KEY,
                tipo VARCHAR(100) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sensores (
                id SERIAL PRIMARY KEY,
                uuid VARCHAR(100) UNIQUE
            );
            CREATE TABLE IF NOT EXISTS mediciones (
                id SERIAL PRIMARY KEY,
                sensorId VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                valor FLOAT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                tipo INTEGER REFERENCES tipos(id)
            );
            CREATE TABLE IF NOT EXISTS actividad (
                id SERIAL PRIMARY KEY,
                horas FLOAT[],
                distancia FLOAT[]
            );
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL,
                actividad_id INTEGER REFERENCES actividad(id),
                nodo_id INTEGER[],
                alertas INTEGER[]
            );
            CREATE TABLE usuario_sensores (
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                sensor_uuid VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                PRIMARY KEY (usuario_id, sensor_uuid)
            );
        `);
        res.status(200).send({ message: "Successfully created all tables" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/**
 * @brief Crea un nuevo tipo de sensor en la base de datos.
 *
 * Esta ruta permite agregar un nuevo tipo de sensor en la tabla `Tipos`. El tipo de sensor
 * debe proporcionarse en el cuerpo de la solicitud en formato JSON.
 *
 * @param req Solicitud HTTP que contiene un JSON con el campo `tipo`, que es el tipo de sensor a agregar.
 * @param res Respuesta HTTP que devolverá un mensaje indicando si la creación fue exitosa o no.
 *
 * @return Devuelve un código de estado 200 si el tipo se creó correctamente, o 500 si hubo un error.
 */
app.post('/tipos', async (req, res) => {
    const { tipo } = req.body;
    try {
        await pool.query('INSERT INTO tipos (tipo) VALUES ($1)', [tipo]);
        res.status(200).send({ message: "Sensor type created successfully" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


/**
 * @brief Inserta un nuevo sensor en la base de datos.
 *
 * Esta ruta permite agregar un nuevo uuid de sensor a la tabla 'sensores'.
 *
 * @route POST /sensors
 * @param {string} tipo - El tipo de sensor (por ejemplo, 'temperature', 'ozono').
 * @return {object} 200 - Sensor creado exitosamente.
 * @return {object} 500 - Error interno del servidor.
 */
app.post('/sensores', async (req, res) => {
    const { uuid } = req.body; // uuid incluido
    try {
        await pool.query('INSERT INTO sensores (uuid) VALUES ($1)', [uuid]);
        res.status(200).send({ message: "Sensor created successfully" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Insertar un sensor (medición) con un userId
/**
 * @brief Inserta una nueva medición en la base de datos.
 *
 * Esta ruta permite registrar una medición asociada a un sensor específico y un usuario.
 *
 * @route POST /mediciones
 * @param {string} sensorId - El ID del sensor asociado a la medición.
 * @param {float} valor - El valor de la medición.
 * @param {string} timestamp - Marca de tiempo en formato ISO 8601.
 * @param {int} tipo - El ID del tipo de medición.
 * @param {int} userId - El ID del usuario que realiza la medición.
 * @return {object} 200 - Medición agregada exitosamente.
 * @return {object} 400 - Faltan parámetros necesarios.
 * @return {object} 404 - Usuario o sensor no encontrado.
 * @return {object} 500 - Error interno del servidor.
 */
app.post('/mediciones', async (req, res) => {
    const { sensorId, valor, timestamp, tipo, userId } = req.body;

    // Validar el cuerpo de la solicitud
    if (!sensorId || !valor || !timestamp || !tipo || !userId) {
        return res.status(400).send({ message: "Faltan parámetros necesarios" });
    }

    try {
        // Verificar si el sensor existe
        const sensorResult = await pool.query('SELECT * FROM sensores WHERE uuid = $1', [sensorId]);
        if (sensorResult.rows.length === 0) {
            return res.status(404).send({ message: "Sensor no encontrado" });
        }

        // Verificar si el usuario existe
        const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).send({ message: "Usuario no encontrado" });
        }

        // Insertar la medición
        await pool.query(
            'INSERT INTO mediciones (sensorId, valor, timestamp, tipo) VALUES ($1, $2, $3, $4)',
            [sensorId, valor, timestamp, tipo]
        );

        res.status(200).send({ message: "Medición agregada exitosamente" });
    } catch (err) {
        console.error(err); // Cambié a console.error para errores
        res.sendStatus(500);
    }
});


/**
 * @brief Obtiene las mediciones más recientes de los sensores.
 *
 * Retorna los últimos valores registrados.
 *
 * @route GET /latest/:uuid
 * @return {object} 200 - Datos de las mediciones más recientes.
 * @return {object} 500 - Error interno del servidor.
 */
app.get('/latest/:uuid', async (req, res) => {
    const { uuid } = req.params;
    try {
        // Buscar el sensor por UUID
        const sensorQuery = await pool.query('SELECT id FROM sensores WHERE uuid = $1', [uuid]);
        if (sensorQuery.rows.length === 0) {
            return res.status(404).send({ message: "Sensor not found" });
        }
        const sensorId = sensorQuery.rows[0].id;

        // Obtener la última medición del sensor
        const latestMeasurement = await pool.query(`
            SELECT valor, timestamp 
            FROM mediciones 
            WHERE sensorId = $1 
            ORDER BY timestamp DESC 
            LIMIT 1
        `, [uuid]); // Usar el UUID directamente en la consulta

        if (latestMeasurement.rows.length === 0) {
            return res.status(404).send({ message: "No measurements found for this sensor" });
        }

        res.status(200).send(latestMeasurement.rows[0]);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Routes
/**
 * @brief Ruta principal para obtener todas las tablas.
 *
 * Devuelve una lista de todas las tablas en la base de datos.
 *
 * @route GET /
 * @return {object} 200 - Datos de todos los sensores y usuarios.
 * @return {object} 500 - Error interno del servidor.
 */
app.get('/', async (req, res) => {
    try {
        const tiposQuery = await pool.query('SELECT * FROM tipos');
        const medicionesQuery = await pool.query('SELECT * FROM mediciones');
        const sensoresQuery = await pool.query('SELECT * FROM sensores');
        const usuariosQuery = await pool.query('SELECT * FROM usuarios');
        const actividadQuery = await pool.query('SELECT * FROM actividad');
        const usrSensQuery = await pool.query('SELECT * FROM usuario_sensores');

        const responseData = {
            tipos: tiposQuery.rows,
            mediciones: medicionesQuery.rows,
            sensores: sensoresQuery.rows,
            usuarios: usuariosQuery.rows,
            actividad: actividadQuery.rows,
            usuario_sensores: usrSensQuery.rows
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Insertar un nuevo usuario
/**
 * @brief Crea un nuevo usuario en la base de datos.
 *
 * Inserta un nuevo usuario en la tabla 'usuarios' y asigna los sensores correspondientes.
 *
 * @route POST /users
 * @param {string} username - Nombre de usuario.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @param {array} sensorUuids - Lista de UUID de sensores a asignar al usuario.
 * @return {object} 201 - Usuario agregado exitosamente.
 * @return {object} 500 - Error interno del servidor.
 */
app.post('/users', async (req, res) => {
    const { username, email, password, sensorUuids } = req.body;

    try {
        // 1. Crear una entrada de actividad
        const actividadResult = await pool.query(`
            INSERT INTO actividad (horas, distancia) 
            VALUES (ARRAY[0], ARRAY[0]) RETURNING id
        `);
        const actividadId = actividadResult.rows[0].id;

        // 2. Crear el nuevo usuario con la actividad y alerta asociadas
        const newUserResult = await pool.query(`
            INSERT INTO usuarios (username, email, password, actividad_id)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, [username, email, password, actividadId]);

        const newUserId = newUserResult.rows[0].id;

        // 3. Asignar sensores al nuevo usuario en la tabla intermedia
        if (Array.isArray(sensorUuids) && sensorUuids.length > 0) {
            const sensorAssignments = sensorUuids.map(async (uuid) => {
                if (uuid) { // Verifica que uuid no sea null o vacío
                    // Inserta el sensor en la tabla 'sensores' si es válido
                    await pool.query('INSERT INTO sensores (uuid) VALUES ($1) ON CONFLICT (uuid) DO NOTHING', [uuid]);

                    // Asigna el sensor al usuario
                    return pool.query(`
                        INSERT INTO usuario_sensores (usuario_id, sensor_uuid) 
                        VALUES ($1, $2)
                    `, [newUserId, uuid]);
                }
            });

            await Promise.all(sensorAssignments);
        }

        res.status(201).send({ message: "User created successfully", userId: newUserId });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Resetear (eliminar todas las tablas y recrearlas)
/**
 * @brief Reinicia las tablas de la base de datos con datos predeterminados.
 *
 * Borra las tablas existentes y las recrea con datos predeterminados para usuarios y sensores.
 *
 * @route DELETE /reset
 * @return {object} 200 - Tablas reiniciadas exitosamente con datos predeterminados.
 * @return {object} 500 - Error interno del servidor.
 */
app.delete('/reset', async (req, res) => {
    try {
        // Eliminando las tablas si existen
        await pool.query(`
            DROP TABLE IF EXISTS mediciones CASCADE;
            DROP TABLE IF EXISTS usuario_sensores CASCADE;
            DROP TABLE IF EXISTS sensores CASCADE;
            DROP TABLE IF EXISTS actividad CASCADE;
            DROP TABLE IF EXISTS usuarios CASCADE;
            DROP TABLE IF EXISTS alertas CASCADE;
            DROP TABLE IF EXISTS tipos CASCADE;
        `);

        // Creando las tablas
        await pool.query(`
            CREATE TABLE tipos (
                id SERIAL PRIMARY KEY,
                tipo VARCHAR(100) NOT NULL
            );
            CREATE TABLE sensores (
                id SERIAL PRIMARY KEY,
                uuid VARCHAR(100) NOT NULL UNIQUE
            );
            CREATE TABLE mediciones (
                id SERIAL PRIMARY KEY,
                sensorId VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                valor FLOAT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                tipo INTEGER REFERENCES tipos(id)
            );
            CREATE TABLE actividad (
                id SERIAL PRIMARY KEY,
                horas FLOAT[],
                distancia FLOAT[]
            );
            CREATE TABLE usuarios (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL,
                actividad_id INTEGER REFERENCES actividad(id),
                alertas INTEGER[]
            );
            CREATE TABLE usuario_sensores (
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                sensor_uuid VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                PRIMARY KEY (usuario_id, sensor_uuid)
            );
        `);

        // Insertando datos por defecto en la tabla tipos
        await pool.query(`
            INSERT INTO tipos (tipo) VALUES ('temperature'), ('ozono');
        `);

        // Insertando datos por defecto en la tabla sensores
        await pool.query(`
            INSERT INTO sensores (uuid) VALUES 
            ('sensor-uuid-1'), 
            ('sensor-uuid-2');
        `);

        // Insertando datos por defecto en la tabla actividad
        const actividadResult = await pool.query(`
            INSERT INTO actividad (horas, distancia) 
            VALUES (ARRAY[1.5, 2.0, 3.0], ARRAY[100.0, 200.0, 300.0]) RETURNING id
        `);
        const actividadId = actividadResult.rows[0].id;

        // Insertando usuarios y asignando actividad_id y alertas
        const user1Result = await pool.query(`
            INSERT INTO usuarios (username, email, password, actividad_id) VALUES 
            ('user1', 'user1@example.com', 'pass1', $1) RETURNING id
        `, [actividadId]);

        const user1Id = user1Result.rows[0].id;

        const user2Result = await pool.query(`
            INSERT INTO usuarios (username, email, password, actividad_id, alertas) VALUES 
            ('user2', 'user2@example.com', 'pass2', $1, Array[202]::integer[]) RETURNING id
        `, [actividadId]);

        const user2Id = user2Result.rows[0].id;

        // Asignando sensores a usuarios en la tabla intermedia
        await pool.query(`
            INSERT INTO usuario_sensores (usuario_id, sensor_uuid) VALUES 
            ($1, 'sensor-uuid-1'), 
            ($2, 'sensor-uuid-2');
        `, [user1Id, user2Id]);

        res.status(200).send({ message: "Successfully reset tables with default data" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


// Eliminar todas las tablas
/**
 * @brief Elimina todas las tablas en la base de datos.
 *
 * Borra las tablas 'sensores', 'mediciones', 'usuarios', 'actividad' y 'alertas' si existen.
 *
 * @route DELETE /erase
 * @return {object} 200 - Éxito al eliminar todas las tablas.
 * @return {object} 500 - Error interno del servidor.
 */
app.delete('/erase', async (req, res) => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS mediciones CASCADE;
            DROP TABLE IF EXISTS sensores CASCADE;
            DROP TABLE IF EXISTS actividad CASCADE;
            DROP TABLE IF EXISTS usuarios CASCADE;
            DROP TABLE IF EXISTS tipos CASCADE;
        `);
        res.status(200).send({ message: "Successfully erased all tables" });
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