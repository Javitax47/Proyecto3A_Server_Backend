const pool = require('../db');

const createSensorType = async (tipo) => {
    try {
        await pool.query('INSERT INTO tipos (tipo) VALUES ($1)', [tipo]);
        return { message: "Sensor type created successfully" };
    } catch (err) {
        throw new Error("Error creating sensor type");
    }
};

const setupTables = async () => {
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
        return { message: "Successfully created all tables" };
    } catch (err) {
        console.log(err);
        throw new Error("Error creating tables: " + err);
    }
};

const resetTables = async () => {
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
                                            ('sensorJavier'),
                                            ('OFFICIAL');
        `);

        // Insertando mediciones por defecto
        const medicionData = [
            // Mediciones para sensor-uuid-1
            { sensor_id: 'sensor-uuid-1', valor: 22.5, timestamp: '2024-12-04 10:00:00', tipo: 1, location: '(40.4168, -3.7038)' },
            { sensor_id: 'sensor-uuid-1', valor: 23.1, timestamp: '2024-12-04 11:00:00', tipo: 2, location: '(40.4169, -3.7039)' },
            { sensor_id: 'sensor-uuid-1', valor: 22.9, timestamp: '2024-12-04 12:00:00', tipo: 1, location: '(40.4170, -3.7040)' },
            { sensor_id: 'sensor-uuid-1', valor: 121.3, timestamp: '2024-12-04 13:00:00', tipo: 2, location: '(40.4180, -3.7045)' },

            // Mediciones para sensor-uuid-2
            { sensor_id: 'sensor-uuid-2', valor: 110.0, timestamp: '2024-12-04 10:15:00', tipo: 2, location: '(39.4699, -0.3763)' },
            { sensor_id: 'sensor-uuid-2', valor: 19.8, timestamp: '2024-12-04 11:15:00', tipo: 1, location: '(39.4700, -0.3765)' },
            { sensor_id: 'sensor-uuid-2', valor: 112.5, timestamp: '2024-12-04 12:15:00', tipo: 2, location: '(39.4701, -0.3767)' },
            { sensor_id: 'sensor-uuid-2', valor: 20.4, timestamp: '2024-12-04 13:15:00', tipo: 1, location: '(39.4702, -0.3769)' },

            // Mediciones para sensorJavier
            { sensor_id: 'sensorJavier', valor: 72.0, timestamp: '2024-12-04 09:30:00', tipo: 2, location: '(41.3879, 2.16992)' },
            { sensor_id: 'sensorJavier', valor: 18.7, timestamp: '2024-12-04 10:30:00', tipo: 1, location: '(41.3880, 2.17000)' },
            { sensor_id: 'sensorJavier', valor: 75.5, timestamp: '2024-12-04 11:30:00', tipo: 2, location: '(41.3885, 2.17010)' },
            { sensor_id: 'sensorJavier', valor: 19.2, timestamp: '2024-12-04 12:30:00', tipo: 1, location: '(41.3890, 2.17020)' },

            // Mediciones para OFFICIAL
            { sensor_id: 'OFFICIAL', valor: 18.0, timestamp: '2024-12-04 08:00:00', tipo: 1, location: '(37.7749, -122.4194)' },
            { sensor_id: 'OFFICIAL', valor: 115.0, timestamp: '2024-12-04 09:00:00', tipo: 2, location: '(37.7750, -122.4196)' },
            { sensor_id: 'OFFICIAL', valor: 19.5, timestamp: '2024-12-04 10:00:00', tipo: 1, location: '(37.7755, -122.4198)' },
            { sensor_id: 'OFFICIAL', valor: 120.8, timestamp: '2024-12-04 11:00:00', tipo: 2, location: '(37.7760, -122.4200)' }
        ];

        for (const medicion of medicionData) {
            await pool.query(`
                INSERT INTO mediciones (sensor_id, valor, timestamp, tipo, location)
                VALUES ($1, $2, $3, $4, $5)
            `, [medicion.sensor_id, medicion.valor, medicion.timestamp, medicion.tipo, medicion.location]);
        }

        for (const medicion of medicionData) {
            await pool.query(`
                INSERT INTO mediciones (sensor_id, valor, timestamp, tipo, location)
                VALUES ($1, $2, $3, $4, $5)
            `, [medicion.sensor_id, medicion.valor, medicion.timestamp, medicion.tipo, medicion.location]);
        }

        // Creando usuarios con actividad_id únicos
        const userData = [
            { username: 'user1', email: 'user1@example.com', password: 'pass1' },
            { username: 'user2', email: 'user2@example.com', password: 'pass2' },
            { username: 'Javier', email: 'correo@gmail.com', password: '123' },
            { username: 'AEMET', email: 'aemet@gmail.com', password: '123' }
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
                                                                          ('correo@gmail.com', 'sensorJavier'),
                                                                          ('aemet@gmail.com', 'OFFICIAL');
        `);
        return { message: "Successfully reset tables with default data" };
    } catch (err) {
        console.log(err);
        throw new Error("Error reseteando las tablas: " + err);
    }
};

const getTables = async () => {
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

        return responseData;
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};

const eraseTables = async () => {
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
        return { message: "Successfully erased all tables" };
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};

module.exports = { createSensorType, setupTables, resetTables, getTables, eraseTables };