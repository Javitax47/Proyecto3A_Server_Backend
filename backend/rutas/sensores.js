const express = require('express');
const { createSensor } = require('../servicios/sensores');
const router = express.Router();

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

module.exports = router;