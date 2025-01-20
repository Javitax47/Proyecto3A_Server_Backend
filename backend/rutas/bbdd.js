/**
 * @file bbddRouter.js
 * @brief Gestión de rutas relacionadas con la base de datos en el servidor.
 * 
 * Este archivo define las rutas para gestionar las operaciones de configuración, reinicio,
 * creación de tipos de sensor y otras operaciones relacionadas con las tablas de la base de datos.
 */

const express = require('express');
const { createSensorType, setupTables, resetTables, getTables, eraseTables } = require('../servicios/bbdd');
const router = express.Router();

/**
 * @brief Crea un nuevo tipo de sensor en la base de datos.
 * 
 * @route POST /tipos
 * @param {string} tipo - Nombre del tipo de sensor a crear.
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.post('/tipos', async (req, res) => {
    const { tipo } = req.body;
    try {
        const result = await createSensorType(tipo);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Configura las tablas de la base de datos.
 * 
 * @route GET /setup
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.get('/setup', async (req, res) => {
    try {
        const result = await setupTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Reinicia las tablas de la base de datos.
 * 
 * @route DELETE /reset
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.delete('/reset', async (req, res) => {
    try {
        const result = await resetTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Obtiene información sobre las tablas de la base de datos.
 * 
 * @route GET /
 * @returns {Object} Respuesta con los datos de las tablas.
 * @throws {Error} Error interno del servidor.
 */
router.get('/', async (req, res) => {
    try {
        const result = await getTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Elimina las tablas de la base de datos.
 * 
 * @route DELETE /erase
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.delete('/erase', async (req, res) => {
    try {
        const result = await eraseTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Exporta el router para ser utilizado en la aplicación principal.
 */
module.exports = router;
