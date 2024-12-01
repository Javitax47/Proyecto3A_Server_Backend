const express = require('express');
const { usuarios, sensoresDeUsuarios, usuariosAutent, actualizarUsuarios } = require('../servicios/usuarios');

ç
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

module.exports = router;