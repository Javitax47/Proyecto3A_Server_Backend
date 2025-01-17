const pool = require('../db');

const createSensorType = async (tipo) => {
    try {
        await pool.query('INSERT INTO tipos (tipo) VALUES ($1)', [tipo]);
        return { message: "Sensor type created successfully" };
    } catch (err) {
        throw new Error("Error creating sensor type");
    }
};

const setupTables = async () => {
    try {
        // Creando las tablas
        await pool.query(`
            CREATE TABLE tipos (
                                   id SERIAL PRIMARY KEY,
                                   tipo VARCHAR(100) NOT NULL
            );

            CREATE TABLE sensores (
                                      id SERIAL PRIMARY KEY,
                                      uuid VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE mediciones (
                                        id SERIAL PRIMARY KEY,
                                        sensor_id VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                        valor FLOAT NOT NULL,
                                        timestamp TIMESTAMP NOT NULL,
                                        tipo INTEGER REFERENCES tipos(id),
                                        location POINT
            );

            CREATE TABLE actividad (
                                       id SERIAL PRIMARY KEY,
                                       horas FLOAT[],
                                       distancia FLOAT[]
            );

            CREATE TABLE usuarios (
                                      username VARCHAR(100) NOT NULL,
                                      email VARCHAR(100) PRIMARY KEY,
                                      password VARCHAR(100) NOT NULL,
                                      actividad_id INTEGER REFERENCES actividad(id),
                                      verification_token VARCHAR(255),
                                      is_verified BOOLEAN DEFAULT FALSE,
                                      admin BOOLEAN DEFAULT FALSE,
                                      active BOOLEAN DEFAULT TRUE
            );

            CREATE TABLE alertas_usuarios (
                                              id SERIAL PRIMARY KEY,
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE
            );

            CREATE TABLE alertas (
                                     id SERIAL PRIMARY KEY,
                                     alertas_usuarios_id INTEGER REFERENCES alertas_usuarios(id) ON DELETE CASCADE,
                                     timestamp TIMESTAMP NOT NULL,
                                     location POINT,
                                     codigo INTEGER
            );

            CREATE TABLE usuario_sensores (
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE,
                                              sensor_uuid VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                              PRIMARY KEY (usuario_email, sensor_uuid)
            );
        `);
        return { message: "Successfully created all tables" };
    } catch (err) {
        console.log(err);
        throw new Error("Error creating tables: " + err);
    }
};

const resetTables = async () => {
    try {
        // Eliminando las tablas si existen
        await pool.query(`
            DROP TABLE IF EXISTS mediciones CASCADE;
            DROP TABLE IF EXISTS usuario_sensores CASCADE;
            DROP TABLE IF EXISTS alertas_usuarios CASCADE;
            DROP TABLE IF EXISTS sensores CASCADE;
            DROP TABLE IF EXISTS actividad CASCADE;
            DROP TABLE IF EXISTS usuarios CASCADE;
            DROP TABLE IF EXISTS alertas CASCADE;
            DROP TABLE IF EXISTS tipos CASCADE;
        `);

        // Creando las tablas
        await pool.query(`
            CREATE TABLE tipos (
                                   id SERIAL PRIMARY KEY,
                                   tipo VARCHAR(100) NOT NULL
            );

            CREATE TABLE sensores (
                                      id SERIAL PRIMARY KEY,
                                      uuid VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE mediciones (
                                        id SERIAL PRIMARY KEY,
                                        sensor_id VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                        valor FLOAT NOT NULL,
                                        timestamp TIMESTAMP NOT NULL,
                                        tipo INTEGER REFERENCES tipos(id),
                                        location POINT
            );

            CREATE TABLE actividad (
                                       id SERIAL PRIMARY KEY,
                                       horas FLOAT[],
                                       distancia FLOAT[]
            );

            CREATE TABLE usuarios (
                                      username VARCHAR(100) NOT NULL,
                                      email VARCHAR(100) PRIMARY KEY,
                                      password VARCHAR(100) NOT NULL,
                                      actividad_id INTEGER REFERENCES actividad(id),
                                      verification_token VARCHAR(255),
                                      is_verified BOOLEAN DEFAULT FALSE,
                                      admin BOOLEAN DEFAULT FALSE,
                                      active BOOLEAN DEFAULT TRUE
            );

            CREATE TABLE alertas_usuarios (
                                              id SERIAL PRIMARY KEY,
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE
            );

            CREATE TABLE alertas (
                                     id SERIAL PRIMARY KEY,
                                     alertas_usuarios_id INTEGER REFERENCES alertas_usuarios(id) ON DELETE CASCADE,
                                     timestamp TIMESTAMP NOT NULL,
                                     location POINT,
                                     codigo INTEGER
            );

            CREATE TABLE usuario_sensores (
                                              usuario_email VARCHAR(100) REFERENCES usuarios(email) ON DELETE CASCADE,
                                              sensor_uuid VARCHAR(100) REFERENCES sensores(uuid) ON DELETE CASCADE,
                                              PRIMARY KEY (usuario_email, sensor_uuid)
            );
        `);

        // Insertando datos por defecto en la tabla tipos
        await pool.query(`
            INSERT INTO tipos (tipo) VALUES ('temperature'), ('ozono');
        `);

        // Insertando datos por defecto en la tabla sensores
        await pool.query(`
            INSERT INTO sensores (uuid) VALUES
                                            ('sensor-uuid-1'),
                                            ('sensor-uuid-2'),
                                            ('sensorJavier'),
                                            ('OFFICIAL');
        `);

<<<<<<< Updated upstream
        const medicionData = [
            {
                sensor_id: 'sensor-uuid-1',
                valor: 72.6,
                timestamp: '2025-01-17 08:00:00',
                tipo: 2,
                location: '(38.9900, -0.1633)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 21.3,
                timestamp: '2025-01-17 08:03:00',
                tipo: 1,
                location: '(38.9905, -0.1614)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 22.6,
                timestamp: '2025-01-17 08:07:00',
                tipo: 1,
                location: '(38.9911, -0.1588)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 37.4,
                timestamp: '2025-01-17 08:14:00',
                tipo: 2,
                location: '(38.9922, -0.1650)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 9.9,
                timestamp: '2025-01-17 08:21:00',
                tipo: 1,
                location: '(38.9975, -0.1692)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 88.1,
                timestamp: '2025-01-17 08:28:00',
                tipo: 2,
                location: '(38.9897, -0.1721)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 79.1,
                timestamp: '2025-01-17 08:31:30',
                tipo: 2,
                location: '(38.9944, -0.1661)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 0.2,
                timestamp: '2025-01-17 08:35:00',
                tipo: 1,
                location: '(38.9991, -0.1600)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 67.2,
                timestamp: '2025-01-17 08:42:00',
                tipo: 2,
                location: '(38.9933, -0.1579)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 19.2,
                timestamp: '2025-01-17 08:49:00',
                tipo: 1,
                location: '(38.9901, -0.1684)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 27.9,
                timestamp: '2025-01-17 08:56:00',
                tipo: 1,
                location: '(38.9999, -0.1678)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 11.7,
                timestamp: '2025-01-17 09:03:00',
                tipo: 2,
                location: '(38.9915, -0.1744)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 86.7,
                timestamp: '2025-01-17 09:00:00',
                tipo: 2,
                location: '(38.9988, -0.1589)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 14.1,
                timestamp: '2025-01-17 09:03:00',
                tipo: 1,
                location: '(38.9969, -0.1675)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 9.2,
                timestamp: '2025-01-17 09:06:00',
                tipo: 1,
                location: '(38.9950, -0.1760)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 50.8,
                timestamp: '2025-01-17 09:12:00',
                tipo: 2,
                location: '(38.9906, -0.1677)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 17.7,
                timestamp: '2025-01-17 09:18:00',
                tipo: 1,
                location: '(38.9933, -0.1651)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 74.2,
                timestamp: '2025-01-17 09:24:00',
                tipo: 2,
                location: '(38.9972, -0.1708)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 5.5,
                timestamp: '2025-01-17 09:30:00',
                tipo: 1,
                location: '(38.9901, -0.1598)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 54.8,
                timestamp: '2025-01-17 09:33:00',
                tipo: 2,
                location: '(38.9915, -0.1669)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 3.2,
                timestamp: '2025-01-17 09:36:00',
                tipo: 2,
                location: '(38.9928, -0.1739)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 26.7,
                timestamp: '2025-01-17 09:42:00',
                tipo: 1,
                location: '(38.9955, -0.1742)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 88.0,
                timestamp: '2025-01-17 09:48:00',
                tipo: 2,
                location: '(38.9944, -0.1690)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 7.4,
                timestamp: '2025-01-17 09:54:00',
                tipo: 1,
                location: '(38.9987, -0.1644)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 23.2,
                timestamp: '2025-01-17 10:00:00',
                tipo: 1,
                location: '(38.9902, -0.1633)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 61.2,
                timestamp: '2025-01-17 10:03:00',
                tipo: 2,
                location: '(38.9938, -0.1617)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 83.7,
                timestamp: '2025-01-17 10:06:00',
                tipo: 2,
                location: '(38.9973, -0.1601)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 0.7,
                timestamp: '2025-01-17 10:12:00',
                tipo: 1,
                location: '(38.9914, -0.1599)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 33.7,
                timestamp: '2025-01-17 10:18:00',
                tipo: 2,
                location: '(38.9899, -0.1733)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 67.1,
                timestamp: '2025-01-17 10:24:00',
                tipo: 2,
                location: '(38.9964, -0.1721)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 18.7,
                timestamp: '2025-01-17 10:30:00',
                tipo: 1,
                location: '(38.9944, -0.1676)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 85.2,
                timestamp: '2025-01-17 10:33:00',
                tipo: 2,
                location: '(38.9933, -0.1721)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 24.9,
                timestamp: '2025-01-17 10:36:00',
                tipo: 1,
                location: '(38.9922, -0.1766)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 88.2,
                timestamp: '2025-01-17 10:42:00',
                tipo: 2,
                location: '(38.9983, -0.1661)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 47.2,
                timestamp: '2025-01-17 10:48:00',
                tipo: 2,
                location: '(38.9957, -0.1589)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 0.1,
                timestamp: '2025-01-17 10:54:00',
                tipo: 1,
                location: '(38.9905, -0.1699)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 70.8,
                timestamp: '2025-01-17 08:10:00',
                tipo: 2,
                location: '(38.9981, -0.1742)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 10.9,
                timestamp: '2025-01-17 08:20:00',
                tipo: 1,
                location: '(38.9956, -0.1676)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 1.8,
                timestamp: '2025-01-17 08:30:00',
                tipo: 1,
                location: '(38.9930, -0.1611)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 7.6,
                timestamp: '2025-01-17 08:50:00',
                tipo: 1,
                location: '(38.9974, -0.1701)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 88.8,
                timestamp: '2025-01-17 09:10:00',
                tipo: 2,
                location: '(38.9898, -0.1645)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 5.0,
                timestamp: '2025-01-17 09:20:00',
                tipo: 1,
                location: '(38.9900, -0.1627)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 42.0,
                timestamp: '2025-01-17 09:30:00',
                tipo: 2,
                location: '(38.9901, -0.1609)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 25.2,
                timestamp: '2025-01-17 09:50:00',
                tipo: 1,
                location: '(38.9917, -0.1672)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 60.3,
                timestamp: '2025-01-17 10:10:00',
                tipo: 2,
                location: '(38.9921, -0.1719)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 19.6,
                timestamp: '2025-01-17 10:30:00',
                tipo: 1,
                location: '(38.9950, -0.1698)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 27.4,
                timestamp: '2025-01-17 10:40:00',
                tipo: 1,
                location: '(38.9939, -0.1611)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 50.1,
                timestamp: '2025-01-17 10:50:00',
                tipo: 2,
                location: '(38.9966, -0.1584)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 72.6,
                timestamp: '2025-01-17 09:06:30',
                tipo: 2,
                location: '(38.9930, -0.1700)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 12.9,
                timestamp: '2025-01-17 09:10:00',
                tipo: 1,
                location: '(38.9945, -0.1697)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 71.8,
                timestamp: '2025-01-17 09:57:00',
                tipo: 2,
                location: '(38.9978, -0.1633)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 10.2,
                timestamp: '2025-01-17 09:59:30',
                tipo: 1,
                location: '(38.9982, -0.1615)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 72.7,
                timestamp: '2025-01-17 10:57:00',
                tipo: 2,
                location: '(38.9930, -0.1683)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 15.9,
                timestamp: '2025-01-17 10:55:00',
                tipo: 1,
                location: '(38.9952, -0.1603)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 68.1,
                timestamp: '2025-01-17 09:13:00',
                tipo: 2,
                location: '(38.9947, -0.1689)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 14.8,
                timestamp: '2025-01-17 09:16:00',
                tipo: 1,
                location: '(38.9955, -0.1693)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 24.6,
                timestamp: '2025-01-17 11:00:00',
                tipo: 1,
                location: '(38.9924, -0.1670)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 47.5,
                timestamp: '2025-01-17 11:07:00',
                tipo: 2,
                location: '(38.9931, -0.1692)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 20.9,
                timestamp: '2025-01-17 11:14:00',
                tipo: 1,
                location: '(38.9980, -0.1610)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 50.0,
                timestamp: '2025-01-17 10:05:00',
                tipo: 2,
                location: '(38.9962, -0.1601)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 9.0,
                timestamp: '2025-01-17 10:10:00',
                tipo: 1,
                location: '(38.9957, -0.1662)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 80.0,
                timestamp: '2025-01-17 10:15:00',
                tipo: 2,
                location: '(38.9995, -0.1720)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 12.7,
                timestamp: '2025-01-17 10:22:00',
                tipo: 1,
                location: '(38.9905, -0.1604)'
            },
            {
                sensor_id: 'sensor-uuid-2',
                valor: 86.6,
                timestamp: '2025-01-17 10:28:00',
                tipo: 2,
                location: '(38.9922, -0.1712)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 72.7,
                timestamp: '2025-01-17 10:57:00',
                tipo: 2,
                location: '(38.9930, -0.1683)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 10.6,
                timestamp: '2025-01-17 11:03:00',
                tipo: 1,
                location: '(38.9927, -0.1675)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 76.7,
                timestamp: '2025-01-17 11:09:00',
                tipo: 2,
                location: '(38.9909, -0.1690)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 26.1,
                timestamp: '2025-01-17 11:15:00',
                tipo: 1,
                location: '(38.9971, -0.1668)'
            },
            {
                sensor_id: 'sensorJavier',
                valor: 48.9,
                timestamp: '2025-01-17 11:21:00',
                tipo: 2,
                location: '(38.9953, -0.1704)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 15.9,
                timestamp: '2025-01-17 10:55:00',
                tipo: 1,
                location: '(38.9952, -0.1603)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 88.8,
                timestamp: '2025-01-17 11:05:00',
                tipo: 2,
                location: '(38.9960, -0.1650)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 22.0,
                timestamp: '2025-01-17 11:15:00',
                tipo: 1,
                location: '(38.9922, -0.1621)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 56.9,
                timestamp: '2025-01-17 11:25:00',
                tipo: 2,
                location: '(38.9931, -0.1688)'
            },
            {
                sensor_id: 'OFFICIAL',
                valor: 13.6,
                timestamp: '2025-01-17 11:35:00',
                tipo: 1,
                location: '(38.9909, -0.1602)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 86.6,
                timestamp: '2025-01-17 12:00:00',
                tipo: 2,
                location: '(38.9898, -0.1750)'
            },
            {
                sensor_id: 'sensor-uuid-1',
                valor: 28.8,
                timestamp: '2025-01-17 12:05:00',
                tipo: 1,
                location: '(38.9911, -0.1770)'
            }
        ];
=======
        
                // Insertando mediciones con coordenadas ajustadas para cubrir Valencia
                    const medicionData = [
                        // Mediciones para sensor-uuid-1
                        { sensor_id: 'sensor-uuid-1', valor: 22.5, timestamp: '2024-12-04 10:00:00', tipo: 1, location: '(39.4695, -0.3750)' },
                        { sensor_id: 'sensor-uuid-1', valor: 23.1, timestamp: '2024-12-04 11:00:00', tipo: 2, location: '(39.4698, -0.3800)' },
                        { sensor_id: 'sensor-uuid-1', valor: 22.9, timestamp: '2024-12-04 12:00:00', tipo: 1, location: '(39.4702, -0.3705)' },
                        { sensor_id: 'sensor-uuid-1', valor: 121.3, timestamp: '2024-12-04 13:00:00', tipo: 2, location: '(39.4710, -0.3608)' },

                        // Mediciones para sensor-uuid-2
                        { sensor_id: 'sensor-uuid-2', valor: 110.0, timestamp: '2024-12-04 10:15:00', tipo: 2, location: '(39.4750, -0.3702)' },
                        { sensor_id: 'sensor-uuid-2', valor: 19.8, timestamp: '2024-12-04 11:15:00', tipo: 1, location: '(39.4689, -0.3654)' },
                        { sensor_id: 'sensor-uuid-2', valor: 112.5, timestamp: '2024-12-04 12:15:00', tipo: 2, location: '(39.4721, -0.3766)' },
                        { sensor_id: 'sensor-uuid-2', valor: 20.4, timestamp: '2024-12-04 13:15:00', tipo: 1, location: '(39.4705, -0.3688)' },

                        // Mediciones para sensorJavier
                        { sensor_id: 'sensorJavier', valor: 72.0, timestamp: '2024-12-04 09:30:00', tipo: 2, location: '(39.4703, -0.3740)' },
                        { sensor_id: 'sensorJavier', valor: 18.7, timestamp: '2024-12-04 10:30:00', tipo: 1, location: '(39.4677, -0.3725)' },
                        { sensor_id: 'sensorJavier', valor: 75.5, timestamp: '2024-12-04 11:30:00', tipo: 2, location: '(39.4665, -0.3624)' },
                        { sensor_id: 'sensorJavier', valor: 19.2, timestamp: '2024-12-04 12:30:00', tipo: 1, location: '(39.4723, -0.3559)' },

                        // Mediciones para OFFICIAL
                        { sensor_id: 'OFFICIAL', valor: 18.0, timestamp: '2024-12-04 08:00:00', tipo: 1, location: '(39.4742, -0.3666)' },
                        { sensor_id: 'OFFICIAL', valor: 115.0, timestamp: '2024-12-04 09:00:00', tipo: 2, location: '(39.4735, -0.3698)' },
                        { sensor_id: 'OFFICIAL', valor: 19.5, timestamp: '2024-12-04 10:00:00', tipo: 1, location: '(39.4658, -0.3744)' },
                        { sensor_id: 'OFFICIAL', valor: 120.8, timestamp: '2024-12-04 11:00:00', tipo: 2, location: '(39.4715, -0.3717)' }
                    ];


>>>>>>> Stashed changes

        for (const medicion of medicionData) {
            await pool.query(`
                INSERT INTO mediciones (sensor_id, valor, timestamp, tipo, location)
                VALUES ($1, $2, $3, $4, $5)
            `, [medicion.sensor_id, medicion.valor, medicion.timestamp, medicion.tipo, medicion.location]);
        }

        // Creando usuarios con actividad_id únicos
        const userData = [
            { username: 'user1', email: 'user1@example.com', password: 'pass1' },
            { username: 'user2', email: 'user2@example.com', password: 'pass2' },
            { username: 'Javier', email: 'correo@gmail.com', password: '123' },
            { username: 'AEMET', email: 'aemet@gmail.com', password: '123' }
        ];

        for (const user of userData) {
            // Insertando una nueva actividad para cada usuario
            const actividadResult = await pool.query(`
                INSERT INTO actividad (horas, distancia)
                VALUES (ARRAY[1.5, 2.0, 3.0], ARRAY[100.0, 200.0, 300.0]) RETURNING id
            `);
            const actividadId = actividadResult.rows[0].id;

            // Insertando usuario con el id único de actividad
            await pool.query(`
                INSERT INTO usuarios (username, email, password, actividad_id) VALUES
                    ($1, $2, $3, $4)
            `, [user.username, user.email, user.password, actividadId]);

            // Creando primero el registro en alertas_usuarios para obtener el ID
            const alertasUsuariosResult = await pool.query(`
                INSERT INTO alertas_usuarios (usuario_email) VALUES ($1) RETURNING id
            `, [user.email]);
            const alertaId = alertasUsuariosResult.rows[0].id;

            // Usando el mismo ID para crear la alerta
            await pool.query(`
                INSERT INTO alertas (alertas_usuarios_id, timestamp, location, codigo)
                VALUES ($1, CURRENT_TIMESTAMP, POINT(1.0, 2.0), 120)
            `, [alertaId]);
        }

        // Asignando sensores a usuarios en la tabla intermedia
        await pool.query(`
            INSERT INTO usuario_sensores (usuario_email, sensor_uuid) VALUES
                                                                          ('user1@example.com', 'sensor-uuid-1'),
                                                                          ('user2@example.com', 'sensor-uuid-2'),
                                                                          ('correo@gmail.com', 'sensorJavier'),
                                                                          ('aemet@gmail.com', 'OFFICIAL');
        `);
        return { message: "Successfully reset tables with default data" };
    } catch (err) {
        console.log(err);
        throw new Error("Error reseteando las tablas: " + err);
    }
};

const getTables = async () => {
    try {
        const tiposQuery = await pool.query('SELECT * FROM tipos');
        const medicionesQuery = await pool.query('SELECT * FROM mediciones');
        const sensoresQuery = await pool.query('SELECT * FROM sensores');
        const usuariosQuery = await pool.query('SELECT * FROM usuarios');
        const actividadQuery = await pool.query('SELECT * FROM actividad');
        const usrSensQuery = await pool.query('SELECT * FROM usuario_sensores');
        const usrAlertsQuery = await pool.query('SELECT * FROM alertas_usuarios');
        const alertasQuery = await pool.query('SELECT * FROM alertas');

        const responseData = {
            tipos: tiposQuery.rows,
            mediciones: medicionesQuery.rows,
            sensores: sensoresQuery.rows,
            usuarios: usuariosQuery.rows,
            actividad: actividadQuery.rows,
            usuario_sensores: usrSensQuery.rows,
            alertas_usuarios: usrAlertsQuery.rows,
            alertas: alertasQuery.rows
        };

        return responseData;
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};

const eraseTables = async () => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS mediciones CASCADE;
            DROP TABLE IF EXISTS usuario_sensores CASCADE;
            DROP TABLE IF EXISTS alertas_usuarios CASCADE;
            DROP TABLE IF EXISTS sensores CASCADE;
            DROP TABLE IF EXISTS actividad CASCADE;
            DROP TABLE IF EXISTS usuarios CASCADE;
            DROP TABLE IF EXISTS alertas CASCADE;
            DROP TABLE IF EXISTS tipos CASCADE;
        `);
        return { message: "Successfully erased all tables" };
    } catch (err) {
        console.log(err);
        throw new Error("Error al devolver las tablas: " + err);
    }
};

module.exports = { createSensorType, setupTables, resetTables, getTables, eraseTables };