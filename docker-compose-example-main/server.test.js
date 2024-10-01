/**
 * @file server.test.js
 * @brief Pruebas automáticas para las rutas de la API del servidor utilizando Supertest y Jest.
 *
 * Este archivo contiene una serie de pruebas unitarias que simulan las interacciones con las rutas de la API del servidor
 * sin necesidad de conectarse a una base de datos real, utilizando mocks de Jest.
 */

const request = require('supertest');
const app = require('./server');
const pool = require('./db'); ///< @brief Se simula el pool de la base de datos con un mock.

jest.mock('./db'); ///< @brief Se crea un mock del módulo de la base de datos para evitar conexiones reales.

/**
 * @brief Conjunto de pruebas para las rutas de la API.
 *
 * Se describen diversas pruebas que comprueban el comportamiento de las rutas del servidor.
 */
describe('API Routes', () => {

    /**
     * @brief Limpia los mocks antes de cada prueba.
     *
     * Esta función se ejecuta antes de cada prueba para asegurarse de que no haya interferencias
     * entre los diferentes tests.
     */
    beforeEach(() => {
        pool.query.mockClear(); ///< @brief Limpia el mock de la base de datos entre cada prueba.
    });

    /**
     * @test
     * @brief Prueba para la ruta GET /setup.
     *
     * Esta prueba verifica que las tablas 'users' y 'sensors' se crean correctamente.
     * Se simula una respuesta exitosa del método `query` de la base de datos.
     */
    it('should set up tables successfully', async () => {
        pool.query.mockResolvedValue({}); ///< @brief Simula que la consulta a la base de datos fue exitosa.

        const res = await request(app).get('/setup');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', "Successfully created users and sensors tables");
    });

    /**
     * @test
     * @brief Prueba para la ruta POST /users.
     *
     * Esta prueba verifica que un nuevo usuario se crea correctamente en la base de datos.
     * Se simula una respuesta exitosa de la inserción en la base de datos.
     */
    it('should create a new user', async () => {
        pool.query.mockResolvedValue({}); ///< @brief Simula la inserción exitosa de un usuario en la base de datos.

        const res = await request(app)
            .post('/users')
            .send({ username: 'testuser' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', "Successfully added user");
    });

    /**
     * @test
     * @brief Prueba para la ruta POST /.
     *
     * Verifica que no se puede insertar datos de un sensor si el usuario no existe.
     * Se simula que no se encontró el usuario en la base de datos.
     */
    it('should not insert sensor data if user does not exist', async () => {
        pool.query.mockResolvedValue({ rows: [] }); ///< @brief Simula que el usuario no existe en la base de datos.

        const res = await request(app)
            .post('/')
            .send({ type: 'temperature', value: 25, timestamp: new Date().toISOString(), userId: 999 });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', "User does not exist");
    });

    /**
     * @test
     * @brief Prueba para la ruta DELETE /reset.
     *
     * Verifica que las tablas de la base de datos se resetean correctamente y se insertan datos por defecto.
     * Se simula una respuesta exitosa de las consultas para borrar y recrear las tablas.
     */
    it('should reset the tables successfully', async () => {
        pool.query.mockResolvedValue({}); ///< @brief Simula las consultas exitosas para resetear las tablas.

        const res = await request(app).delete('/reset');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', "Successfully reset users and sensors tables with default data");
    });
});
