/**
 * @file server.js
 * @brief API para gestionar usuarios y sensores, incluyendo funcionalidades de creación, consulta, inserción y eliminación de datos.
 *
 * Este servidor Express gestiona las tablas de usuarios y sensores, proporcionando rutas para agregar datos de sensores,
 * obtener los datos más recientes y reiniciar las tablas en una base de datos PostgreSQL.
 */

const express = require('express');
const cors = require('cors');
const { startAlertas } = require('./emitirAlertas');
const { official_data, fetchAirQuality} = require('./official_data');
const { resetTables } = require('./servicios/bbdd');


const rutabbdd = require('./rutas/bbdd');
const rutaSensores = require('./rutas/sensores');
const rutaMediciones = require('./rutas/mediciones');
const rutaAlertas = require('./rutas/alertas');
const rutaUsuarios = require('./rutas/usuarios');

const port = 3000;

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< Updated upstream
startAlertas();

fetchAirQuality();
official_data();

resetTables();
=======
resetTables()
startAlertas()
official_data()
>>>>>>> Stashed changes

app.use('/', rutabbdd);
app.use('/sensores', rutaSensores);
app.use('/', rutaMediciones);
app.use('/alertas', rutaAlertas);
app.use('/', rutaUsuarios);

// Iniciar el servidor
if (require.main === module) {
    /**
     * @brief Inicia el servidor en el puerto 3000.
     *
     * Muestra un mensaje en la consola cuando el servidor está en funcionamiento.
     */
    app.listen(port, () => console.log(`Server running on port: ${port}`));
}

module.exports = app; // Exportar el app para usarlo en las pruebas