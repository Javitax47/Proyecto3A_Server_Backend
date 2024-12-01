const express = require('express');
const { borrarAlertas, borrarAlertasUsuarios, borrarAlertasEspecificasUsuario, getAlertasUsuario } = require('../servicios/alertas');
const router = express.Router();

router.delete('/', async (req, res) => {
    try {
        const result = await borrarAlertas();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

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

module.exports = router;