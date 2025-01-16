const express = require('express');
const { medicion, latest, getMediciones} = require('../servicios/mediciones');
const router = express.Router();


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

module.exports = router;