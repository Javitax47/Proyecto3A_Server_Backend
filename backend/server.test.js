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

    test('GET /latest debe retornar los últimos datos de temperatura y ozono', async () => {
        // Mock de la respuesta de la base de datos para los sensores
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, type: 'temperature', value: 23.5, timestamp: '2024-09-22T12:00:00Z' }],
        }).mockResolvedValueOnce({
            rows: [{ id: 2, type: 'ozono', value: 500, timestamp: '2024-09-22T12:01:00Z' }],
        });

        const response = await request(app).get('/latest');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            temperature: { id: 1, type: 'temperature', value: 23.5, timestamp: '2024-09-22T12:00:00Z' },
            ozono: { id: 2, type: 'ozono', value: 500, timestamp: '2024-09-22T12:01:00Z' }
        });
    });

    test('POST /users debe insertar un nuevo usuario', async () => {
        // Mock de la respuesta de la base de datos para insertar un usuario
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app)
            .post('/users')
            .send({ username: 'new_user' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Successfully added user' });
    });

    test('POST / debe insertar un nuevo sensor', async () => {
        // Mock para comprobar si el usuario existe
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, username: 'user1' }],
        });

        // Mock para insertar el sensor
        pool.query.mockResolvedValueOnce({
            rows: [],
        });

        const response = await request(app)
            .post('/')
            .send({
                type: 'temperature',
                value: 22.5,
                timestamp: '2024-10-05T12:00:00Z',
                userId: 1
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Successfully added sensor data' });
    });
});