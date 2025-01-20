/**
 * @file sensoresService.js
 * @brief Funciones para gestionar sensores en la base de datos.
 * 
 * Este módulo contiene funciones para la creación y asociación de sensores a usuarios.
 */

const pool = require('../db');

/**
 * @brief Crea un nuevo sensor y lo asocia a un usuario en la base de datos.
 * 
 * @param {string} uuid - Identificador único del sensor.
 * @param {string} email - Correo electrónico del usuario al que se asociará el sensor.
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al crear el sensor o asociarlo al usuario.
 */
const createSensor = async (uuid, email) => {
    try {
        // Inserta el sensor en la tabla de sensores
        await pool.query('INSERT INTO sensores (uuid) VALUES ($1)', [uuid]);

        // Asocia el sensor al usuario en la tabla intermedia
        await pool.query('INSERT INTO usuario_sensores (usuario_email, sensor_uuid) VALUES ($1, $2)', [email, uuid]);

        return { message: "Sensor created successfully" };
    } catch (err) {
        console.log(err);
        throw new Error("Error creating sensor: " + err);
    }
};

module.exports = { createSensor };
