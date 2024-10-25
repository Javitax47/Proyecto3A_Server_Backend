const request = require('supertest');
const app = require('./server');  // Importamos la app del servidor

let server;

beforeAll(() => {
    // Iniciar el servidor antes de ejecutar las pruebas
    server = app.listen(13000, () => console.log('Test server running on port 13000'));
});

afterAll(async () => {
    await server.close();  // Cierra el servidor después de todas las pruebas
});

// Mock de la base de datos
jest.mock('./db', () => ({
    query: jest.fn(),
}));

const pool = require('./db'); // Importamos el pool para mockear las consultas

describe('Servidor API', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada test
    });

    test('GET /latest/:uuid debe retornar los últimos datos de medición para un sensor específico', async () => {
        const uuid = 'test-uuid'; // UUID simulado
        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: 1 }], // Simulación de búsqueda del sensor por UUID
            })
            .mockResolvedValueOnce({
                rows: [{ valor: 23.5, timestamp: '2024-09-22T12:00:00Z' }], // Simulación de la última medición
            });

        const response = await request(app).get(`/latest/${uuid}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ valor: 23.5, timestamp: '2024-09-22T12:00:00Z' });
    });

    test('POST /users debe insertar un nuevo usuario', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app)
            .post('/users')
            .send({
                username: 'new_user',
                email: 'new_user@example.com',
                password: 'password123'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "User created successfully" });
    });

    test('POST /tipos debe insertar un nuevo tipo de sensor', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app)
            .post('/tipos')
            .send({
                tipo: 'ozono',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Sensor type created successfully" });
    });

    test('POST /sensores debe insertar un nuevo sensor', async () => {
        const uuid = 'test-uuid'; // UUID simulado
        const tipo = 'temperature'; // Tipo simulado
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Simulación de búsqueda del tipo
            .mockResolvedValueOnce({ rows: [] }); // Simulación de inserción

        const response = await request(app)
            .post('/sensores')
            .send({
                uuid: uuid,
                tipo: tipo,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Sensor created successfully" });
    });

    test('POST /mediciones debe insertar una nueva medición', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app)
            .post('/mediciones')
            .send({
                sensorId: "RIGOEN59-WLX5LP6",
                valor: 500,
                timestamp: '2024-09-22T12:00:00Z',
                tipo: 1
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Medición agregada exitosamente" });
    });

    test('DELETE /users/:id/measurements debe eliminar las mediciones de un usuario', async () => {
        const userId = 1; // ID del usuario simulado
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app).delete(`/users/${userId}/measurements`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Successfully deleted measurements for user" });
    });

    test('DELETE /reset debe reiniciar las tablas con datos predeterminados', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app).delete('/reset');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Successfully reset tables with default data" });
    });

    test('DELETE /erase debe eliminar todas las tablas', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app).delete('/erase');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Successfully erased all tables" });
    });
});
