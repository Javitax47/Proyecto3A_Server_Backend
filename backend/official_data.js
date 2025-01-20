/**
 * @file official_data.js
 * @brief Integración con la API de calidad del aire para obtener y registrar mediciones oficiales.
 *
 * Este archivo realiza solicitudes periódicas a una API externa para recopilar datos de ozono
 * y temperatura, y registra las mediciones en el servidor.
 */

const axios = require('axios'); ///< @brief Cliente HTTP para realizar solicitudes a la API.
const { medicion } = require('./servicios/mediciones'); ///< @brief Servicio para registrar mediciones en la base de datos.

/**
 * @brief URL de la API de calidad del aire.
 * 
 * Esta API proporciona datos de ozono (O3) y temperatura, junto con otras métricas ambientales.
 */
const API_URL = 'https://api.waqi.info/feed/here/?token=e30e80ec8de604abfaa0689bac8eb50e8c772706';

/**
 * @brief Configura la consulta periódica a la API.
 *
 * Esta función inicia un intervalo para llamar a la API de calidad del aire cada 30 segundos.
 */
const official_data = () => {
    setInterval(fetchAirQuality, 30000); ///< @brief Intervalo de 30 segundos para consultar la API.
};

/**
 * @brief Realiza una solicitud a la API y registra los datos obtenidos en el servidor.
 *
 * Este método consulta los datos de ozono y temperatura de la API y los envía al servidor
 * como mediciones oficiales.
 */
const fetchAirQuality = async () => {
    try {
        // Solicitar datos de la API
        const response = await axios.get(API_URL);
        const data = response.data;

        if (data.status === 'ok') {
            const { aqi, iaqi, city, time } = data.data; ///< @brief Datos principales de la respuesta de la API.

            /**
             * @brief Objeto de medición de ozono.
             *
             * Incluye información sobre el sensor, el valor de ozono, la ubicación y el tiempo de la medición.
             */
            const medicion_ozono = {
                sensor_id: 'OFFICIAL', ///< @brief Identificador único del sensor.
                valor: iaqi.o3?.v || 0, ///< @brief Valor de ozono en ppm, predeterminado 0 si no está presente.
                timestamp: time.iso, ///< @brief Marca de tiempo de la medición.
                tipo: 2, ///< @brief ID del tipo de medición (2 para ozono).
                location: (${city.geo[0]}, ${city.geo[1]}) ///< @brief Coordenadas geográficas del sensor.
            };

            // Enviar medición de ozono al servidor
            await medicion(
                medicion_ozono.sensor_id,
                medicion_ozono.valor,
                medicion_ozono.timestamp,
                medicion_ozono.tipo,
                medicion_ozono.location
            );
            console.log('Medición de ozono enviada:', medicion_ozono);

            /**
             * @brief Verifica y procesa los datos de temperatura.
             *
             * Comprueba si los datos de temperatura están disponibles en la respuesta de la API
             * y los envía al servidor.
             */
            if (iaqi.t) {
                const medicion_temperatura = {
                    sensor_id: 'OFFICIAL',
                    valor: iaqi.t.v, ///< @brief Valor de temperatura en °C.
                    timestamp: time.iso,
                    tipo: 1, ///< @brief ID del tipo de medición (1 para temperatura).
                    location: (${city.geo[0]}, ${city.geo[1]})
                };

                // Enviar medición de temperatura al servidor
                await medicion(
                    medicion_temperatura.sensor_id,
                    medicion_temperatura.valor,
                    medicion_temperatura.timestamp,
                    medicion_temperatura.tipo,
                    medicion_temperatura.location
                );
                console.log('Medición de temperatura enviada:', medicion_temperatura);
            } else {
                console.warn('No se encontró el valor de temperatura en los datos de la API.');
            }
        } else {
            console.error('Error en los datos de la API:', data.data);
        }
    } catch (err) {
        console.error('Error al realizar la solicitud a la API o enviar datos:', err.message);
    }
};

module.exports = { 
    official_data, ///< @brief Función para iniciar la recopilación de datos oficiales.
    fetchAirQuality ///< @brief Función para consultar la API y registrar las mediciones.
};