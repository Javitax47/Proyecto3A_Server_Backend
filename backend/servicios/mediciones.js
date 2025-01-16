const pool = require('../db');

const medicion = async (sensorId, valor, timestamp, tipo, location) => {
    // Validar el cuerpo de la solicitud
    if (!sensorId || !valor || !timestamp || !tipo || !location) {
        throw new Error("Faltan parámetros necesarios");
    }

    try {
        // Verificar si el sensor existe
        const sensorResult = await pool.query('SELECT * FROM sensores WHERE uuid = $1', [sensorId]);
        if (sensorResult.rows.length === 0) {
            throw new Error("Sensor no encontrado");
        }

        await pool.query(
            'INSERT INTO mediciones (sensor_id, valor, timestamp, tipo, location) VALUES ($1, $2, $3, $4, $5)',
            [sensorId, valor, timestamp, tipo, location]
        );


        return { message: "Medición agregada exitosamente" };
    } catch (err) {
        console.error('Error al insertar la medición:', err); // Mensaje más descriptivo en el servidor
        throw new Error("Error al insertar la medición: " + err);
    }
};

const latest = async (email) => {
    try {
        // Obtener el UUID del usuario basado en el correo electrónico
        const userQuery = await pool.query('SELECT sensor_uuid FROM usuario_sensores WHERE usuario_email = $1', [email]);

        if (userQuery.rows.length === 0) {
            return res.status(404).send({ message: "User not found" });
        }

        // Inicializar objeto para almacenar las mediciones
        const latestData = {
            ozono: null,
            temperature: null
        };

        // Crear una consulta para obtener las últimas mediciones de temperatura y ozono
        const sensorUUIDs = userQuery.rows.map(row => row.sensor_uuid);

        if (sensorUUIDs.length > 0) {
            const latestMeasurements = await pool.query(`
                SELECT valor, timestamp, tipo
                FROM mediciones
                WHERE sensor_id = ANY($1::text[])
                ORDER BY timestamp DESC
            `, [sensorUUIDs]);

            // Procesar las mediciones obtenidas
            for (const measurement of latestMeasurements.rows) {
                if (measurement.tipo === 1 && !latestData.temperature) { // 1 para temperatura
                    latestData.temperature = {
                        value: measurement.valor,
                        timestamp: measurement.timestamp
                    };
                } else if (measurement.tipo === 2 && !latestData.ozono) { // 2 para ozono
                    latestData.ozono = {
                        value: measurement.valor,
                        timestamp: measurement.timestamp
                    };
                }
                // Salir del bucle si ambas mediciones han sido encontradas
                if (latestData.temperature && latestData.ozono) {
                    break;
                }
            }
        }

        // Verifica si se encontraron las mediciones
        if (!latestData.temperature && !latestData.ozono) {
            throw new Error("No measurements found for this user");
        }
        return latestData;
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
};

const getMediciones = async (fecha) => {
    try {
        // Filtra las mediciones por el mismo día (ignora la hora)
        const query = 'SELECT * FROM mediciones WHERE CAST(timestamp AS DATE) = CAST($1 AS DATE)';

        // Ejecuta la consulta con la fecha como parámetro
        const medicionesQuery = await pool.query(query, [fecha]);

        return medicionesQuery.rows;
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};



module.exports = { medicion, latest, getMediciones };