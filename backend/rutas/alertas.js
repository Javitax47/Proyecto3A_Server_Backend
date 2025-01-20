/**
 * @file alertasRouter.js
 * @brief Gestión de rutas relacionadas con alertas en el servidor.
 * 
 * Este archivo define las rutas para gestionar alertas, incluyendo la eliminación de alertas globales,
 * alertas específicas de un usuario y alertas específicas de un usuario por ID, así como la consulta de alertas de un usuario.
 */

const express = require('express');
const { borrarAlertas, borrarAlertasUsuarios, borrarAlertasEspecificasUsuario, getAlertasUsuario } = require('../servicios/alertas');
const router = express.Router();

/**
 * @brief Elimina todas las alertas del sistema.
 * 
 * @route DELETE /
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.delete('/', async (req, res) => {
    try {
        const result = await borrarAlertas();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Elimina todas las alertas asociadas a un usuario específico.
 * 
 * @route DELETE /:email
 * @param {string} email - Correo electrónico del usuario cuyas alertas serán eliminadas.
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.delete('/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await borrarAlertasUsuarios(email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Elimina una alerta específica asociada a un usuario.
 * 
 * @route DELETE /:email/:alertaId
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} alertaId - Identificador de la alerta a eliminar.
 * @returns {Object} Respuesta con el resultado de la operación.
 * @throws {Error} Error interno del servidor.
 */
router.delete('/:email/:alertaId', async (req, res) => {
    const { email, alertaId } = req.params;
    try {
        const result = await borrarAlertasEspecificasUsuario(email, alertaId);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

/**
 * @brief Obtiene todas las alertas asociadas a un usuario específico.
 * 
 * @route GET /:email
 * @param {string} email - Correo electrónico del usuario cuyas alertas serán consultadas.
 * @returns {Object} Respuesta con las alertas del usuario.
 * @throws {Error} Error interno del servidor.
 */
router.get('/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await getAlertasUsuario(email);
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
