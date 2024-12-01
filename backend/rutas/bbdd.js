const express = require('express');
const { createSensorType, setupTables, resetTables, getTables, eraseTables } = require('../servicios/bbdd');
const router = express.Router();

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

router.get('/setup', async (req, res) => {
    try {
        const result = await setupTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.delete('/reset', async (req, res) => {
    try {
        const result = await resetTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await getTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.delete('/erase', async (req, res) => {
    try {
        const result = await eraseTables();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;