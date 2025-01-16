const pool = require('./db');

const startAlertas = () => {
    const NORMAL_LIMITS = {
        temperature: { min: 0, max: 40 },
        ozono: { min: 0, max: 300 }
    };

    const lastAlertTimes = {}; // Mantener los últimos tiempos de alerta por usuario
    const processedMeasurementIds = new Set(); // Para evitar procesar la misma medición varias veces

    const checkSensorData = async () => {
        try {
            const result = await pool.query(`
                SELECT m.id, m.valor, m.timestamp, m.tipo, m.sensor_id, u.email
                FROM mediciones m
                         JOIN usuario_sensores us ON us.sensor_uuid = m.sensor_id
                         JOIN usuarios u ON u.email = us.usuario_email
                ORDER BY m.timestamp DESC
                LIMIT 10;
            `);

            const mediciones = result.rows;

            for (const medicion of mediciones) {
                const tipoMedicion = medicion.tipo === 1 ? 'temperature' : 'ozono';
                const { id, valor, sensor_id, email } = medicion;
                const limits = NORMAL_LIMITS[tipoMedicion];

                if (!processedMeasurementIds.has(id)) {
                    let alertaCodigo = null;

                    if (valor < limits.min) {
                        alertaCodigo = tipoMedicion === 'temperature' ? 101 : 201; // 101: temperatura baja, 201: ozono bajo
                    } else if (valor > limits.max) {
                        alertaCodigo = tipoMedicion === 'temperature' ? 102 : 202; // 102: temperatura alta, 202: ozono alto
                    }

                    if (alertaCodigo) {
                        const currentTime = Date.now();
                        const lastAlertTime = lastAlertTimes[email] || 0;

                        // Verificar el cooldown solo para el usuario actual
                        if (currentTime - lastAlertTime >= 60000) {
                            console.log(`Valor fuera de rango: ${valor} para el tipo ${tipoMedicion}. Creando alerta con código ${alertaCodigo}...`);

                            try {
                                // Obtener el ID de alertas_usuarios correspondiente al usuario
                                const alertasUsuariosResult = await pool.query(`
                                    SELECT id FROM alertas_usuarios
                                    WHERE usuario_email = $1
                                `, [email]);

                                const alertasUsuariosId = alertasUsuariosResult.rows[0]?.id;

                                if (alertasUsuariosId) {
                                    // Insertar la alerta con el ID obtenido y el código específico
                                    await pool.query(`
                                        INSERT INTO alertas (alertas_usuarios_id, timestamp, location, codigo)
                                        VALUES ($1, CURRENT_TIMESTAMP, POINT(0,0), $2)
                                    `, [alertasUsuariosId, alertaCodigo]);

                                    lastAlertTimes[email] = currentTime; // Actualizar el tiempo de la última alerta para este usuario
                                    processedMeasurementIds.add(id);

                                    console.log(`Alerta creada para el usuario ${email} asociada al sensor ${sensor_id} con código ${alertaCodigo}`);
                                } else {
                                    console.error(`No se encontró el ID de alertas_usuarios para el email: ${email}`);
                                }
                            } catch (err) {
                                console.error(`Error al crear alerta para el usuario ${email}: `, err);
                            }
                        } else {
                            console.log(`Alerta ya enviada a ${email} recientemente, esperando para enviar otra.`);
                        }
                    }
                } else {
                    console.log(`Medición con ID ${id} ya procesada.`);
                }
            }
        } catch (err) {
            console.error('Error al comprobar los datos de los sensores: ', err);
        }
    };

    setInterval(checkSensorData, 5000);
};

// Exportar la función para iniciar las alertas
module.exports = { startAlertas };
