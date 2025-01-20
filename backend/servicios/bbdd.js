/**
 * @file bbddService.js
 * @brief Gestión de base de datos para sensores, usuarios, mediciones y alertas.
 * 
 * Este módulo contiene funciones para crear, configurar, reiniciar y obtener datos de las tablas
 * relacionadas con sensores, usuarios, mediciones y alertas.
 */

const pool = require('../db');

/**
 * @brief Crea un nuevo tipo de sensor en la base de datos.
 * 
 * @param {string} tipo - Nombre del tipo de sensor.
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al crear el tipo de sensor.
 */
const createSensorType = async (tipo) => {
    try {
        await pool.query('INSERT INTO tipos (tipo) VALUES ($1)', [tipo]);
        return { message: "Sensor type created successfully" };
    } catch (err) {
        throw new Error("Error creating sensor type");
    }
};

/**
 * @brief Crea las tablas necesarias en la base de datos.
 * 
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al crear las tablas.
 */
const setupTables = async () => {
    try {
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
                actividad_id INTEGER REFERENCES actividad(id),
                verification_token VARCHAR(255),
                is_verified BOOLEAN DEFAULT FALSE,
                admin BOOLEAN DEFAULT FALSE,
                active BOOLEAN DEFAULT TRUE
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

/**
 * @brief Reinicia las tablas de la base de datos y las llena con datos predeterminados.
 * 
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al reiniciar las tablas.
 */
const resetTables = async () => {
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

        await setupTables();

        await pool.query(`INSERT INTO tipos (tipo) VALUES ('temperature'), ('ozono');`);
        await pool.query(`INSERT INTO sensores (uuid) VALUES ('sensor-uuid-1'), ('sensor-uuid-2');`);

        return { message: "Successfully reset tables with default data" };
    } catch (err) {
        console.log(err);
        throw new Error("Error reseteando las tablas: " + err);
    }
};

/**
 * @brief Obtiene los datos de todas las tablas de la base de datos.
 * 
 * @returns {Object} Datos de las tablas.
 * @throws {Error} Error al obtener los datos de las tablas.
 */
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

        return {
            tipos: tiposQuery.rows,
            mediciones: medicionesQuery.rows,
            sensores: sensoresQuery.rows,
            usuarios: usuariosQuery.rows,
            actividad: actividadQuery.rows,
            usuario_sensores: usrSensQuery.rows,
            alertas_usuarios: usrAlertsQuery.rows,
            alertas: alertasQuery.rows
        };
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};

/**
 * @brief Elimina todas las tablas de la base de datos.
 * 
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al borrar las tablas.
 */
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
