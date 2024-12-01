const axios = require('axios');

const official_data = () => {
    // Configuración de la API
    const API_URL = 'https://api.waqi.info/feed/here/?token=e30e80ec8de604abfaa0689bac8eb50e8c772706';
    const SERVER_URL = 'http://localhost:3000/mediciones';

    // Función para consultar la API y enviar datos al servidor
    const fetchAirQuality = async () => {
        try {
            // Solicitar datos de la API
            const response = await axios.get(API_URL);
            const data = response.data;

            if (data.status === 'ok') {
                const { aqi, iaqi, city, time } = data.data;

                // Estructura de la medición
                const medicion = {
                    sensor_id: 'OFFICIAL', // Cambia al UUID real si aplica
                    valor: iaqi.o3?.v || 0, // Valor de ozono, default 0 si no está presente
                    timestamp: time.iso,
                    tipo: 2, // ID del tipo 'ozono'
                    location: `(${city.geo[0]}, ${city.geo[1]})`
                };

                // Enviar medición al servidor
                await axios.post(SERVER_URL, medicion);
                console.log('Medición enviada:', medicion);
            } else {
                console.error('Error en los datos de la API:', data.data);
            }
        } catch (err) {
            console.error('Error al realizar la solicitud a la API o enviar datos:', err.message);
        }
    };

    // Llamar periódicamente a la API
    setInterval(fetchAirQuality, 5000);
}

// Exportar la función para iniciar las mediciones oficiales
module.exports = { official_data };