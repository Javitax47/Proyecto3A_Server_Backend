/**
 * @file db.js
 * @brief Configuración de la conexión a la base de datos PostgreSQL.
 *
 * Este archivo configura y exporta un pool de conexiones a PostgreSQL
 * utilizando el módulo `pg` para gestionar las interacciones con la base de datos.
 */

const { Pool } = require('pg');

/**
 * @brief Instancia de conexión a la base de datos PostgreSQL.
 *
 * El pool de conexiones permite reutilizar conexiones a la base de datos
 * para mejorar el rendimiento. La configuración incluye el host, puerto,
 * usuario, contraseña y nombre de la base de datos.
 *
 * @param {string} host - Dirección del host de la base de datos.
 * @param {number} port - Puerto en el que escucha la base de datos.
 * @param {string} user - Nombre de usuario para la conexión.
 * @param {string} password - Contraseña para la conexión.
 * @param {string} database - Nombre de la base de datos.
 */
const pool = new Pool({
    host: 'db', ///< @brief Host de la base de datos (por ejemplo, un contenedor Docker llamado 'db').
    port: 5432, ///< @brief Puerto de la base de datos PostgreSQL.
    user: 'user123', ///< @brief Nombre de usuario para conectarse a la base de datos.
    password: 'password123', ///< @brief Contraseña para la conexión.
    database: 'db123' ///< @brief Nombre de la base de datos que se utilizará.
});

module.exports = pool; ///< @brief Exporta el pool de conexiones para que otros módulos lo utilicen.
