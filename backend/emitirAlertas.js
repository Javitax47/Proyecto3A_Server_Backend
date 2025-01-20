/**
 * @file emitirAlertas.js
 * @brief Gestión de alertas basadas en los datos de sensores.
 *
 * Este archivo contiene la lógica para supervisar las mediciones de sensores, verificar
 * si están dentro de los límites normales y generar alertas para los usuarios afectados.
 */

const pool = require('./db'); ///< @brief Conexión al pool de la base de datos PostgreSQL.

/**
 * @brief Función principal para iniciar la supervisión y generación de alertas.
 *
 * Supervisa periódicamente las mediciones de sensores y genera alertas si los valores
 * están fuera de los límites definidos. Las alertas se registran en la base de datos
 * y se gestionan por usuario y tipo de sensor.
 */
const startAlertas = () => {
    const NORMAL_LIMITS = {
        temperature: { min: 0, max: 40 }, ///< @brief Límites normales para la temperatura en °C.
        ozono: { min: 0, max: 300 } ///< @brief Límites normales para el ozono en ppm.
    };

    const lastAlertTimes = {}; ///< @brief Registro de los últimos tiempos de alerta por usuario.
    const processedMeasurementIds = new Set(); ///< @brief Conjunto para rastrear mediciones ya procesadas.

    /**
     * @brief Función para comprobar las mediciones de sensores y generar alertas.
     *
     * Obtiene las últimas mediciones de sensores, verifica si están fuera de los límites normales,
     * y genera alertas si es necesario.
     */
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
                        alertaCodigo = tipoMedicion === 'temperature' ? 101 : 201; ///< @brief Código 101: temperatura baja; 201: ozono bajo.
                    } else if (valor > limits.max) {
                        alertaCodigo = tipoMedicion === 'temperature' ? 102 : 202; ///< @brief Código 102: temperatura alta; 202: ozono alto.
                    }

                    if (alertaCodigo) {
                        const currentTime = Date.now();
                        const lastAlertTime = lastAlertTimes[email] || 0;

                        if (currentTime - lastAlertTime >= 60000) {
                            console.log(Valor fuera de rango: ${valor} para el tipo ${tipoMedicion}. Creando alerta con código ${alertaCodigo}...);

                            try {
                                const alertasUsuariosResult = await pool.query(`
                                    SELECT id FROM alertas_usuarios
                                    WHERE usuario_email = $1
                                `, [email]);

                                const alertasUsuariosId = alertasUsuariosResult.rows[0]?.id;

                                if (alertasUsuariosId) {
                                    await pool.query(`
                                        INSERT INTO alertas (alertas_usuarios_id, timestamp, location, codigo)
                                        VALUES ($1, CURRENT_TIMESTAMP, POINT(0,0), $2)
                                    `, [alertasUsuariosId, alertaCodigo]);

                                    lastAlertTimes[email] = currentTime;
                                    processedMeasurementIds.add(id);

                                    console.log(Alerta creada para el usuario ${email} asociada al sensor ${sensor_id} con código ${alertaCodigo});
                                } else {
                                    console.error(No se encontró el ID de alertas_usuarios para el email: ${email});
                                }
                            } catch (err) {
                                console.error(`Error al crear alerta para el usuario ${email}: `, err);
                            }
                        } else {
                            console.log(Alerta ya enviada a ${email} recientemente, esperando para enviar otra.);
                        }
                    }
                } else {
                    console.log(Medición con ID ${id} ya procesada.);
                }
            }
        } catch (err) {
            console.error('Error al comprobar los datos de los sensores: ', err);
        }
    };

    /**
     * @brief Configura la función checkSensorData para ejecutarse cada 5 segundos.
     */
    setInterval(checkSensorData, 5000);
};

module.exports = { startAlertas }; ///< @brief Exporta la función para iniciar la supervisión de alertas.