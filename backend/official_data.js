const axios = require('axios');
const { medicion } = require('./servicios/mediciones');

// Configuración de la API
const API_URL = 'https://api.waqi.info/feed/here/?token=e30e80ec8de604abfaa0689bac8eb50e8c772706';

const official_data = () => {
    // Llamar periódicamente a la API
    setInterval(fetchAirQuality, 30000);
};

// Función para consultar la API y enviar datos al servidor
const fetchAirQuality = async () => {
    try {
        // Solicitar datos de la API
        const response = await axios.get(API_URL);
        const data = response.data;

        if (data.status === 'ok') {
            const { aqi, iaqi, city, time } = data.data;

            // Medición de ozono
            const medicion_ozono = {
                sensor_id: 'OFFICIAL', // Cambia al UUID real si aplica
                valor: iaqi.o3?.v || 0, // Valor de ozono, default 0 si no está presente
                timestamp: time.iso,
                tipo: 2, // ID del tipo 'ozono'
                location: `(${city.geo[0]}, ${city.geo[1]})`
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

            // Medición de temperatura
            if (iaqi.t) { // Verifica si el valor de temperatura está presente
                const medicion_temperatura = {
                    sensor_id: 'OFFICIAL', // Cambia al UUID real si aplica
                    valor: iaqi.t.v, // Valor de temperatura
                    timestamp: time.iso,
                    tipo: 1, // ID del tipo 'temperatura'
                    location: `(${city.geo[0]}, ${city.geo[1]})`
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

// Exportar la función para iniciar las mediciones oficiales
module.exports = { official_data, fetchAirQuality};
