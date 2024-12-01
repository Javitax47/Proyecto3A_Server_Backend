const pool = require('../db');

const createSensor = async (uuid, email) => {
    try {
        await pool.query('INSERT INTO sensores (uuid) VALUES ($1)', [uuid]);
        await pool.query('INSERT INTO usuario_sensores (usuario_email, sensor_uuid) VALUES ($1, $2)', [email, uuid]);
        return { message: "Sensor created successfully" };
    } catch (err) {
        console.log(err);
        throw new Error("Error creating sensor: " + err);
    }
};

module.exports = { createSensor };
