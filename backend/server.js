/**
 * @file server.js
 * @brief API para gestionar usuarios y sensores, incluyendo funcionalidades de creación, consulta, inserción y eliminación de datos.
 *
 * Este servidor Express gestiona las tablas de usuarios y sensores en una base de datos PostgreSQL.
 * Proporciona rutas para interactuar con las entidades de usuarios, sensores, mediciones, alertas y resetear las tablas.
 */

const express = require('express'); ///< @brief Framework para construir aplicaciones web y APIs.
const cors = require('cors'); ///< @brief Middleware para habilitar el intercambio de recursos de origen cruzado.
const { startAlertas } = require('./emitirAlertas'); ///< @brief Función para iniciar el sistema de alertas basado en mediciones.
const { official_data, fetchAirQuality } = require('./official_data'); ///< @brief Funciones para obtener y registrar datos oficiales.
const { resetTables } = require('./servicios/bbdd'); ///< @brief Función para reiniciar las tablas de la base de datos.

const rutabbdd = require('./rutas/bbdd'); ///< @brief Rutas relacionadas con las operaciones generales de la base de datos.
const rutaSensores = require('./rutas/sensores'); ///< @brief Rutas para gestionar los sensores.
const rutaMediciones = require('./rutas/mediciones'); ///< @brief Rutas para registrar y obtener mediciones.
const rutaAlertas = require('./rutas/alertas'); ///< @brief Rutas para gestionar alertas relacionadas con sensores y usuarios.
const rutaUsuarios = require('./rutas/usuarios'); ///< @brief Rutas para gestionar usuarios.

const port = 3000; ///< @brief Puerto en el que el servidor escucha las solicitudes.

const app = express(); ///< @brief Instancia principal de la aplicación Express.

app.use(cors()); ///< @brief Habilita CORS para todas las rutas.
app.use(express.json()); ///< @brief Middleware para parsear cuerpos de solicitudes en formato JSON.

/**
 * @brief Inicializa los módulos principales.
 * 
 * - startAlertas: Inicia el monitoreo de mediciones para emitir alertas.
 * - fetchAirQuality y official_data: Obtienen y registran datos de calidad del aire.
 * - resetTables: Resetea las tablas de la base de datos.
 */
startAlertas(); ///< Inicia el sistema de alertas.
fetchAirQuality(); ///< Obtiene y registra la calidad del aire.
official_data(); ///< Configura el monitoreo de datos oficiales.
resetTables(); ///< Reinicia las tablas de la base de datos.

/**
 * @brief Configuración de rutas principales.
 *
 * Estas rutas conectan los controladores correspondientes para realizar las operaciones CRUD
 * en las entidades de la base de datos.
 */
app.use('/', rutabbdd); ///< Rutas para operaciones generales de la base de datos.
app.use('/sensores', rutaSensores); ///< Rutas para operaciones con sensores.
app.use('/', rutaMediciones); ///< Rutas para gestionar mediciones.
app.use('/alertas', rutaAlertas); ///< Rutas para gestionar alertas.
app.use('/', rutaUsuarios); ///< Rutas para gestionar usuarios.

/**
 * @brief Inicia el servidor en el puerto especificado.
 *
 * Si este módulo es el principal, lanza el servidor en el puerto definido por port.
 * Muestra un mensaje en la consola indicando que el servidor está en funcionamiento.
 */
if (require.main === module) {
    app.listen(port, () => console.log(Server running on port: ${port}));
}

module.exports = app; ///< @brief Exporta la aplicación Express para pruebas o reutilización.