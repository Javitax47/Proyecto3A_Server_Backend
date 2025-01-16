const express = require('express');
const { usuarios, sensoresDeUsuarios, usuariosAutent, actualizarUsuarios, verificarToken, verificarActualizacion, actualizarContrasena, usuarioAdmin, infoUsers } = require('../servicios/usuarios');

const router = express.Router();

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

router.get('/usuarios/login/:email/:password', async (req, res) => {
    const { email, password } = req.params;
    try {
        const result = await usuariosAutent(email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.put('/users/update', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await actualizarUsuarios(username, email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.put('/users/updatePass', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await actualizarContrasena(email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/token/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await verificarToken(token);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/verificar-actualizacion/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await verificarActualizacion(token);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/esAdmin/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await usuarioAdmin(email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/infoUsers', async (req, res) => {
    try {
        const result = await infoUsers();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;