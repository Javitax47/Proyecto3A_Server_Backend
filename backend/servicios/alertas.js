/**
 * @file alertasService.js
 * @brief Gestión de rutas relacionadas con las mediciones en el servidor.
 * 
 * Este archivo define las rutas para gestionar mediciones de sensores, obtener las últimas mediciones
 * de un usuario por correo y consultar mediciones por fecha específica.
 */

const express = require('express');
const { medicion, latest, getMediciones } = require('../servicios/mediciones');
const router = express.Router();

/**
 * @brief Crea una nueva medición en la base de datos.
 * 
 * @route POST /mediciones
 * @param {string} sensorId - Identificador del sensor.
 * @param {number} valor - Valor medido por el sensor.
 * @param {string} timestamp - Marca de tiempo de la medición.
 * @param {string} tipo - Tipo de medición.
 * @param {Object} location - Ubicación de la medición.
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.post('/mediciones', async (req, res) => {
    const { sensorId, valor, timestamp, tipo, location } = req.body;
    try {
        const result = await medicion(sensorId, valor, timestamp, tipo, location);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Obtiene la última medición de un usuario por correo electrónico.
 * 
 * @route GET /latestByEmail/:email
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Object} Respuesta con la última medición del usuario.
 * @throws {Error} Error interno del servidor.
 */
router.get('/latestByEmail/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await latest(email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Obtiene las mediciones realizadas en una fecha específica.
 * 
 * @route GET /mediciones/:fecha
 * @param {string} fecha - Fecha para consultar las mediciones.
 * @returns {Object} Respuesta con las mediciones realizadas en la fecha.
 * @throws {Error} Error interno del servidor.
 */
router.get('/mediciones/:fecha', async (req, res) => {
    const { fecha } = req.params;
    try {
        const result = await getMediciones(fecha);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Crea un nuevo sensor en la base de datos.
 * 
 * @route POST /
 * @param {string} uuid - Identificador único del sensor.
 * @param {string} email - Correo electrónico del usuario propietario del sensor.
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.post('/', async (req, res) => {
    const { uuid, email } = req.body;
    try {
        const result = await createSensor(uuid, email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Gestión de usuarios y autenticación.
 * 
 * Este módulo contiene rutas para registrar usuarios, autenticar, gestionar sensores asociados,
 * actualizar información y administrar estados de usuarios.
 */

/**
 * @brief Registra un nuevo usuario en la base de datos.
 * 
 * @route POST /usuarios
 * @param {string} username - Nombre del usuario.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.post('/usuarios', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const result = await usuarios(username, email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Obtiene sensores asociados a un usuario específico.
 * 
 * @route GET /usuarios/:email/sensores
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Object} Respuesta con los sensores asociados al usuario.
 * @throws {Error} Error interno del servidor.
 */
router.get('/usuarios/:email/sensores', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await sensoresDeUsuarios(email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});
