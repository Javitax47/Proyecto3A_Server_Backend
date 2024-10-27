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
const { hashPassword, verifyPassword} = require('./security');
const { startAlertas } = require('./alertas');
const port = 3000;

const app = express();
app.use(cors()); ///< @brief Habilita CORS para permitir solicitudes desde diferentes dominios.
app.use(express.json()); ///< @brief Habilita el middleware para procesar JSON en las solicitudes.

// Inicia la comprobación de alertas
startAlertas(pool);

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
                                        sensor_id VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                        valor FLOAT NOT NULL,
                                        timestamp TIMESTAMP NOT NULL,
                                        tipo INTEGER REFERENCES tipos(id),
                                        location POINT
            );

            CREATE TABLE actividad (
                                       id SERIAL PRIMARY KEY,
                                       horas FLOAT[],
                                       distancia FLOAT[]
            );

            CREATE TABLE usuarios (
                                      username VARCHAR(100) NOT NULL,
                                      email VARCHAR(100) PRIMARY KEY,
                                      password VARCHAR(100) NOT NULL,
                                      actividad_id INTEGER REFERENCES actividad(id)
            );

            CREATE TABLE alertas_usuarios (
                                              id SERIAL PRIMARY KEY,
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE
            );

            CREATE TABLE alertas (
                                     id SERIAL PRIMARY KEY,
                                     alertas_usuarios_id INTEGER REFERENCES alertas_usuarios(id) ON DELETE CASCADE,
                                     timestamp TIMESTAMP NOT NULL,
                                     location POINT,
                                     codigo INTEGER
            );

            CREATE TABLE usuario_sensores (
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE,
                                              sensor_uuid VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                              PRIMARY KEY (usuario_email, sensor_uuid)
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
    const { uuid, email } = req.body;
    try {
        await pool.query('INSERT INTO sensores (uuid) VALUES ($1)', [uuid]);
        await pool.query(`INSERT INTO usuario_sensores (usuario_email, sensor_uuid) VALUES ($1, $2)`, [email, uuid]);
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
 * Esta ruta permite registrar una medición asociada a un sensor específico.
 *
 * @route POST /mediciones
 * @param {string} sensorId - El ID del sensor asociado a la medición.
 * @param {float} valor - El valor de la medición.
 * @param {string} timestamp - Marca de tiempo en formato ISO 8601.
 * @param {int} tipo - El ID del tipo de medición.
 * @param {object} location - Las coordenadas de la ubicación (opcional, formato { x: float, y: float }).
 * @return {object} 200 - Medición agregada exitosamente.
 * @return {object} 400 - Faltan parámetros necesarios.
 * @return {object} 404 - Sensor no encontrado.
 * @return {object} 500 - Error interno del servidor.
 */
app.post('/mediciones', async (req, res) => {
    const { sensorId, valor, timestamp, tipo, location } = req.body;

    // Validar el cuerpo de la solicitud
    if (!sensorId || !valor || !timestamp || !tipo) {
        return res.status(400).send({ message: "Faltan parámetros necesarios" });
    }

    try {
        // Verificar si el sensor existe
        const sensorResult = await pool.query('SELECT * FROM sensores WHERE uuid = $1', [sensorId]);
        if (sensorResult.rows.length === 0) {
            return res.status(404).send({ message: "Sensor no encontrado" });
        }

        // Insertar la medición
        await pool.query(
            'INSERT INTO mediciones (sensor_id, valor, timestamp, tipo, location) VALUES ($1, $2, $3, $4, $5)',
            [sensorId, valor, timestamp, tipo, location ? `(${location.x}, ${location.y})` : null]
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
        const usrAlertsQuery = await pool.query('SELECT * FROM alertas_usuarios');
        const alertasQuery = await pool.query('SELECT * FROM alertas');

        const responseData = {
            tipos: tiposQuery.rows,
            mediciones: medicionesQuery.rows,
            sensores: sensoresQuery.rows,
            usuarios: usuariosQuery.rows,
            actividad: actividadQuery.rows,
            usuario_sensores: usrSensQuery.rows,
            alertas_usuarios: usrAlertsQuery.rows,
            alertas: alertasQuery.rows
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
 * @return {object} 201 - Usuario agregado exitosamente.
 * @return {object} 400 - Solicitud incorrecta (datos inválidos).
 * @return {object} 500 - Error interno del servidor.
 */

app.post('/usuarios', async (req, res) => {
    const { username, email, password } = req.body;

    // Validar los datos de entrada
    if (!username || !email || !password) {
        return res.status(400).send({ message: "Faltan campos requeridos" });
    }

    try {
        // 1. Crear una entrada de actividad
        const actividadResult = await pool.query(`
            INSERT INTO actividad (horas, distancia) 
            VALUES (ARRAY[0], ARRAY[0]) RETURNING id
        `);
        const actividadId = actividadResult.rows[0].id;

        // 2. Encriptar la contraseña
        const hashedPassword = await hashPassword(password);

        // 3. Crear el nuevo usuario con la actividad y alerta asociadas
        const newUserResult = await pool.query(`
            INSERT INTO usuarios (username, email, password, actividad_id)
            VALUES ($1, $2, $3, $4) RETURNING email
        `, [username, email, hashedPassword, actividadId]);

        // 4. Creando primero el registro en alertas_usuarios para obtener el ID
        await pool.query(`
            INSERT INTO alertas_usuarios (usuario_email) VALUES ($1) RETURNING id
        `, [email]);

        // 5. Asignar sensores al nuevo usuario en la tabla intermedia
        const newUserEmail = newUserResult.rows[0].email;

        res.status(201).send({ message: "User created successfully", email: newUserEmail });
    } catch (err) {
        console.error(err); // Mejora del logging de errores
        res.sendStatus(500);
    }
});

/**
 * @route GET /usuarios/:email/sensores
 * @group Sensores - Operaciones relacionadas con los sensores
 * @param {string} email.path.required - El correo electrónico del usuario
 * @returns {Array.<Sensor>} 200 - Lista de sensores asignados al usuario
 * @returns {Error} 404 - Usuario no encontrado
 * @returns {Error} 500 - Error interno del servidor si ocurre un problema durante el proceso
 *
 * @description
 * Esta ruta devuelve los sensores asignados a un usuario específico utilizando su correo electrónico.
 */
app.get('/usuarios/:email/sensores', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await pool.query(`
            SELECT s.uuid, s.id 
            FROM sensores s
            JOIN usuario_sensores us ON s.uuid = us.sensor_uuid
            WHERE us.usuario_email = $1
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Usuario no encontrado o sin sensores asignados" });
        }

        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});



// Método para autenticar a un usuario
app.get('/usuarios/login/:email/:password', async (req, res) => {
    const { email, password } = req.params;

    try {
        // Obtener el usuario de la base de datos
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).send({ message: "Email o contraseña incorrectos." });
        }

        const user = userResult.rows[0];

        // Verificar la contraseña
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Email o contraseña incorrectos." });
        }

        // Enviar respuesta exitosa
        res.status(200).send({ message: "Inicio de sesión exitoso", user });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


/**
 * @brief Obtiene las alertas de un usuario específico.
 *
 * Este método permite recuperar todas las alertas asociadas a un usuario
 * utilizando su correo electrónico.
 *
 * @param email Correo electrónico del usuario cuyas alertas se desean obtener.
 * @return JSON array de alertas con detalles como id, timestamp, location y codigo.
 * @throws 404 Si no se encuentran alertas para el usuario.
 * @throws 500 Si ocurre un error en la consulta a la base de datos.
 */
app.get('/alertas/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await pool.query(`
            SELECT a.id, a.timestamp, a.location, a.codigo
            FROM alertas a
            JOIN alertas_usuarios au ON a.alertas_usuarios_id = au.id
            WHERE au.usuario_email = $1
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: "No alerts found for this user." });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/**
 * @brief Elimina todas las alertas de la base de datos.
 *
 * Este método permite eliminar todas las alertas sin restricciones.
 *
 * @return Mensaje de éxito en la eliminación de alertas.
 * @throws 500 Si ocurre un error en la consulta a la base de datos.
 */
app.delete('/alertas', async (req, res) => {
    try {
        await pool.query(`DELETE FROM alertas`);
        res.status(200).send({ message: "All alerts have been deleted." });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/**
 * @brief Elimina todas las alertas de un usuario específico.
 *
 * Este método permite eliminar todas las alertas asociadas a un usuario
 * utilizando su correo electrónico.
 *
 * @param email Correo electrónico del usuario cuyas alertas se desean eliminar.
 * @return Mensaje de éxito en la eliminación de alertas para el usuario.
 * @throws 500 Si ocurre un error en la consulta a la base de datos.
 */
app.delete('/alertas/:email', async (req, res) => {
    const { email } = req.params;
    try {
        await pool.query(`
            DELETE FROM alertas
            WHERE alertas_usuarios_id IN (
                SELECT id FROM alertas_usuarios WHERE usuario_email = $1
            )
        `, [email]);
        res.status(200).send({ message: `All alerts for user ${email} have been deleted.` });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/**
 * @brief Elimina una alerta específica de un usuario.
 *
 * Este método permite eliminar una alerta específica utilizando su ID
 * y el correo electrónico del usuario al que pertenece.
 *
 * @param email Correo electrónico del usuario cuyas alertas se desean eliminar.
 * @param alertaId ID de la alerta que se desea eliminar.
 * @return Mensaje de éxito en la eliminación de la alerta.
 * @throws 404 Si la alerta no se encuentra o no pertenece al usuario.
 * @throws 500 Si ocurre un error en la consulta a la base de datos.
 */
app.delete('/alertas/:email/:alertaId', async (req, res) => {
    const { email, alertaId } = req.params;
    try {
        const result = await pool.query(`
            DELETE FROM alertas
            WHERE id = $1 AND alertas_usuarios_id IN (
                SELECT id FROM alertas_usuarios WHERE usuario_email = $2
            )
        `, [alertaId, email]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Alert not found or does not belong to this user." });
        }

        res.status(200).send({ message: `Alert with ID ${alertaId} has been deleted for user ${email}.` });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Resetear (eliminar todas las tablas y recrearlas)
/**
 * @route DELETE /reset
 * @group Reset - Operaciones para reiniciar la base de datos
 * @returns {object} 200 - Mensaje de éxito al reiniciar las tablas con datos por defecto
 * @returns {Error} 500 - Error interno del servidor si ocurre un problema durante el proceso
 *
 * @description
 * Esta ruta elimina todas las tablas existentes en la base de datos y las recrea con la estructura inicial.
 * Se insertan datos por defecto en las tablas `tipos` y `sensores`. Además, se crean usuarios con
 * actividad única, así como alertas y asignaciones de sensores a usuarios.
 *
 * **Estructura de las tablas creadas:**
 * - `tipos`: Contiene los tipos de mediciones (ej. temperatura, ozono).
 * - `sensores`: Almacena los sensores disponibles con su UUID.
 * - `mediciones`: Guarda las mediciones tomadas por los sensores.
 * - `actividad`: Almacena información sobre la actividad de los usuarios.
 * - `usuarios`: Contiene la información de los usuarios registrados.
 * - `alertas_usuarios`: Relaciona usuarios con alertas.
 * - `alertas`: Almacena las alertas generadas para los usuarios.
 * - `usuario_sensores`: Relaciona usuarios con los sensores asignados.
 *
 * **Datos por defecto insertados:**
 * - Tipos: 'temperature', 'ozono'.
 * - Sensores: 'sensor-uuid-1', 'sensor-uuid-2', 'sensorJavier'.
 * - Tres usuarios con sus respectivas actividades y alertas.
 */
app.delete('/reset', async (req, res) => {
    try {
        // Eliminando las tablas si existen
        await pool.query(`
            DROP TABLE IF EXISTS mediciones CASCADE;
            DROP TABLE IF EXISTS usuario_sensores CASCADE;
            DROP TABLE IF EXISTS alertas_usuarios CASCADE;
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
                                        sensor_id VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                        valor FLOAT NOT NULL,
                                        timestamp TIMESTAMP NOT NULL,
                                        tipo INTEGER REFERENCES tipos(id),
                                        location POINT
            );

            CREATE TABLE actividad (
                                       id SERIAL PRIMARY KEY,
                                       horas FLOAT[],
                                       distancia FLOAT[]
            );

            CREATE TABLE usuarios (
                                      username VARCHAR(100) NOT NULL,
                                      email VARCHAR(100) PRIMARY KEY,
                                      password VARCHAR(100) NOT NULL,
                                      actividad_id INTEGER REFERENCES actividad(id)
            );

            CREATE TABLE alertas_usuarios (
                                              id SERIAL PRIMARY KEY,
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE
            );

            CREATE TABLE alertas (
                                     id SERIAL PRIMARY KEY,
                                     alertas_usuarios_id INTEGER REFERENCES alertas_usuarios(id) ON DELETE CASCADE,
                                     timestamp TIMESTAMP NOT NULL,
                                     location POINT,
                                     codigo INTEGER
            );

            CREATE TABLE usuario_sensores (
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE,
                                              sensor_uuid VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                              PRIMARY KEY (usuario_email, sensor_uuid)
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
                                            ('sensor-uuid-2'),
                                            ('sensorJavier');
        `);

// Creando usuarios con actividad_id únicos
        const userData = [
            { username: 'user1', email: 'user1@example.com', password: 'pass1' },
            { username: 'user2', email: 'user2@example.com', password: 'pass2' },
            { username: 'Javier', email: 'correo@gmail.com', password: '123' }
        ];

        for (const user of userData) {
            // Insertando una nueva actividad para cada usuario
            const actividadResult = await pool.query(`
                INSERT INTO actividad (horas, distancia) 
                VALUES (ARRAY[1.5, 2.0, 3.0], ARRAY[100.0, 200.0, 300.0]) RETURNING id
            `);
            const actividadId = actividadResult.rows[0].id;

            // Insertando usuario con el id único de actividad
            await pool.query(`
                INSERT INTO usuarios (username, email, password, actividad_id) VALUES 
                ($1, $2, $3, $4)
            `, [user.username, user.email, user.password, actividadId]);

            // Creando primero el registro en alertas_usuarios para obtener el ID
            const alertasUsuariosResult = await pool.query(`
                INSERT INTO alertas_usuarios (usuario_email) VALUES ($1) RETURNING id
            `, [user.email]);
            const alertaId = alertasUsuariosResult.rows[0].id;

            // Usando el mismo ID para crear la alerta
            await pool.query(`
                INSERT INTO alertas (alertas_usuarios_id, timestamp, location, codigo) 
                VALUES ($1, CURRENT_TIMESTAMP, POINT(1.0, 2.0), 120)
            `, [alertaId]);
        }

        // Asignando sensores a usuarios en la tabla intermedia
        await pool.query(`
            INSERT INTO usuario_sensores (usuario_email, sensor_uuid) VALUES
                                                                          ('user1@example.com', 'sensor-uuid-1'),
                                                                          ('user2@example.com', 'sensor-uuid-2'),
                                                                          ('correo@gmail.com', 'sensorJavier');
        `);

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
            DROP TABLE IF EXISTS usuario_sensores CASCADE;
            DROP TABLE IF EXISTS alertas_usuarios CASCADE;
            DROP TABLE IF EXISTS sensores CASCADE;
            DROP TABLE IF EXISTS actividad CASCADE;
            DROP TABLE IF EXISTS usuarios CASCADE;
            DROP TABLE IF EXISTS alertas CASCADE;
            DROP TABLE IF EXISTS tipos CASCADE;
        `);
        res.status(200).send({ message: "Successfully erased all tables" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/**
 * @brief Actualiza el perfil de usuario en la base de datos.
 *
 * Permite actualizar los datos de un usuario existente.
 *
 * @route PUT /users/update
 * @param {string} username - Nombre de usuario actualizado.
 * @param {string} email - Correo electrónico actualizado.
 * @param {string} password - Contraseña actualizada.
 * @return {object} 200 - Perfil actualizado exitosamente.
 * @return {object} 500 - Error interno del servidor.
 */
app.put('/users/update', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ message: "Todos los campos son obligatorios" });
    }

    try {
        await pool.query(
            'UPDATE usuarios SET email = $1, password = $2 WHERE username = $3',
            [email, password, username]
        );
        res.status(200).send({ message: "Perfil actualizado correctamente" });
    } catch (err) {
        console.error(err);
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