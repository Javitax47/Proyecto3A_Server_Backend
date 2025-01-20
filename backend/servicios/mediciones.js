/**
 * @file medicionesService.js
 * @brief Funciones para gestionar mediciones en la base de datos.
 * 
 * Este módulo contiene funciones para agregar mediciones, obtener las últimas mediciones
 * y consultar mediciones por fecha específica.
 */

const pool = require('../db');

/**
 * @brief Agrega una nueva medición a la base de datos.
 * 
 * @param {string} sensorId - Identificador único del sensor.
 * @param {number} valor - Valor medido por el sensor.
 * @param {string} timestamp - Fecha y hora de la medición.
 * @param {number} tipo - Tipo de medición (1: temperatura, 2: ozono).
 * @param {string} location - Ubicación de la medición en formato POINT (latitud, longitud).
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error si faltan parámetros o al insertar la medición.
 */
const medicion = async (sensorId, valor, timestamp, tipo, location) => {
    if (!sensorId || !valor || !timestamp || !tipo || !location) {
        throw new Error("Faltan parámetros necesarios");
    }

    try {
        const sensorResult = await pool.query('SELECT * FROM sensores WHERE uuid = $1', [sensorId]);
        if (sensorResult.rows.length === 0) {
            throw new Error("Sensor no encontrado");
        }

        await pool.query(
            'INSERT INTO mediciones (sensor_id, valor, timestamp, tipo, location) VALUES ($1, $2, $3, $4, $5)',
            [sensorId, valor, timestamp, tipo, location]
        );

        return { message: "Medición agregada exitosamente" };
    } catch (err) {
        console.error('Error al insertar la medición:', err);
        throw new Error("Error al insertar la medición: " + err);
    }
};

/**
 * @brief Obtiene las últimas mediciones de temperatura y ozono para un usuario.
 * 
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Object} Últimas mediciones de temperatura y ozono.
 * @throws {Error} Error si no se encuentran mediciones o al ejecutar la consulta.
 */
const latest = async (email) => {
    try {
        const userQuery = await pool.query('SELECT sensor_uuid FROM usuario_sensores WHERE usuario_email = $1', [email]);

        if (userQuery.rows.length === 0) {
            throw new Error("User not found");
        }

        const latestData = {
            ozono: null,
            temperature: null
        };

        const sensorUUIDs = userQuery.rows.map(row => row.sensor_uuid);

        if (sensorUUIDs.length > 0) {
            const latestMeasurements = await pool.query(`
                SELECT valor, timestamp, tipo
                FROM mediciones
                WHERE sensor_id = ANY($1::text[])
                ORDER BY timestamp DESC
            `, [sensorUUIDs]);

            for (const measurement of latestMeasurements.rows) {
                if (measurement.tipo === 1 && !latestData.temperature) {
                    latestData.temperature = {
                        value: measurement.valor,
                        timestamp: measurement.timestamp
                    };
                } else if (measurement.tipo === 2 && !latestData.ozono) {
                    latestData.ozono = {
                        value: measurement.valor,
                        timestamp: measurement.timestamp
                    };
                }

                if (latestData.temperature && latestData.ozono) {
                    break;
                }
            }
        }

        if (!latestData.temperature && !latestData.ozono) {
            throw new Error("No measurements found for this user");
        }

        return latestData;
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
};

/**
 * @brief Obtiene mediciones realizadas en una fecha específica.
 * 
 * @param {string} fecha - Fecha en formato YYYY-MM-DD.
 * @returns {Array} Lista de mediciones realizadas en la fecha proporcionada.
 * @throws {Error} Error al obtener las mediciones.
 */
const getMediciones = async (fecha) => {
    try {
        const query = 'SELECT * FROM mediciones WHERE CAST(timestamp AS DATE) = CAST($1 AS DATE)';
        const medicionesQuery = await pool.query(query, [fecha]);

        return medicionesQuery.rows;
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};

module.exports = { medicion, latest, getMediciones };
