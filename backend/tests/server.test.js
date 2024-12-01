const request = require('supertest');
const app = require('../server');

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

const pool = require('../db'); // Importamos el pool para mockear las consultas

describe('Servidor API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /setup debe crear todas las tablas exitosamente', async () => {
        // Simulamos una respuesta exitosa para la creación de todas las tablas
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get('/setup');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: "Successfully created all tables"
        });
        expect(pool.query).toHaveBeenCalledTimes(1);

        // Verificamos que la query contenga todas las creaciones de tablas necesarias
        const queryCall = pool.query.mock.calls[0][0];
        expect(queryCall).toContain('CREATE TABLE tipos');
        expect(queryCall).toContain('CREATE TABLE sensores');
        expect(queryCall).toContain('CREATE TABLE mediciones');
        expect(queryCall).toContain('CREATE TABLE actividad');
        expect(queryCall).toContain('CREATE TABLE usuarios');
        expect(queryCall).toContain('CREATE TABLE alertas_usuarios');
        expect(queryCall).toContain('CREATE TABLE alertas');
        expect(queryCall).toContain('CREATE TABLE usuario_sensores');
    });

    test('GET /latestByEmail/:email debe retornar los últimos datos de medición para los sensores de un usuario', async () => {
        const email = 'test@example.com';
        pool.query
            .mockResolvedValueOnce({
                rows: [{ sensor_uuid: 'sensor-1' }, { sensor_uuid: 'sensor-2' }] // Sensores del usuario
            })
            .mockResolvedValueOnce({
                rows: [
                    { valor: 23.5, timestamp: '2024-09-22T12:00:00Z', tipo: 1 },
                    { valor: 45.2, timestamp: '2024-09-22T12:00:00Z', tipo: 2 }
                ]
            });

        const response = await request(app).get(`/latestByEmail/${email}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            temperature: { value: 23.5, timestamp: '2024-09-22T12:00:00Z' },
            ozono: { value: 45.2, timestamp: '2024-09-22T12:00:00Z' }
        });
    });

    test('POST /usuarios debe insertar un nuevo usuario', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // actividad
            .mockResolvedValueOnce({ rows: [{ email: 'new_user@example.com' }] }) // usuario
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // alertas_usuarios

        const response = await request(app)
            .post('/usuarios')
            .send({
                username: 'new_user',
                email: 'new_user@example.com',
                password: 'password123'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            message: "User created successfully",
            email: "new_user@example.com"
        });
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
        const uuid = 'test-uuid';
        const email = 'test@example.com';

        pool.query
            .mockResolvedValueOnce({ rows: [] }) // Inserción del sensor
            .mockResolvedValueOnce({ rows: [] }); // Inserción en usuario_sensores

        const response = await request(app)
            .post('/sensores')
            .send({
                uuid: uuid,
                email: email
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Sensor created successfully" });
    });

    test('POST /mediciones debe insertar una nueva medición', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Verificación del sensor
            .mockResolvedValueOnce({ rows: [] }); // Inserción de la medición

        const response = await request(app)
            .post('/mediciones')
            .send({
                sensorId: "RIGOEN59-WLX5LP6",
                valor: 500,
                timestamp: '2024-09-22T12:00:00Z',
                tipo: 1,
                location: { x: 40.4168, y: -3.7038 }
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Medición agregada exitosamente" });
    });

    test('GET /usuarios/:email/sensores debe retornar los sensores de un usuario', async () => {
        const email = 'test@example.com';
        pool.query.mockResolvedValueOnce({
            rows: [
                { uuid: 'sensor-1', id: 1 },
                { uuid: 'sensor-2', id: 2 }
            ]
        });

        const response = await request(app).get(`/usuarios/${email}/sensores`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([
            { uuid: 'sensor-1', id: 1 },
            { uuid: 'sensor-2', id: 2 }
        ]);
    });

    test('GET /alertas/:email debe retornar las alertas de un usuario', async () => {
        const email = 'test@example.com';
        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                timestamp: '2024-09-22T12:00:00Z',
                location: '(40.4168,-3.7038)',
                codigo: 120
            }]
        });

        const response = await request(app).get(`/alertas/${email}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('timestamp');
        expect(response.body[0]).toHaveProperty('location');
        expect(response.body[0]).toHaveProperty('codigo');
    });

    test('DELETE /alertas/:email debe eliminar todas las alertas de un usuario', async () => {
        const email = 'test@example.com';
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).delete(`/alertas/${email}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: `All alerts for user ${email} have been deleted.`
        });
    });

    test('PUT /users/update debe actualizar el perfil de usuario', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .put('/users/update')
            .send({
                username: 'updated_user',
                email: 'test@example.com',
                password: 'newpassword123'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: "Perfil actualizado correctamente"
        });
    });

    test('DELETE /reset debe reiniciar las tablas con datos predeterminados', async () => {
        // Mock sequential responses for different queries
        pool.query
            // Drop tables query
            .mockResolvedValueOnce({ rows: [] })
            // Create tables query
            .mockResolvedValueOnce({ rows: [] })
            // Insert tipos query
            .mockResolvedValueOnce({ rows: [] })
            // Insert sensores query
            .mockResolvedValueOnce({ rows: [] })
            // For each user (3 users, 4 queries each):
            // User 1
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // actividad insert
            .mockResolvedValueOnce({ rows: [] })          // usuarios insert
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // alertas_usuarios insert
            .mockResolvedValueOnce({ rows: [] })          // alertas insert
            // User 2
            .mockResolvedValueOnce({ rows: [{ id: 2 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 2 }] })
            .mockResolvedValueOnce({ rows: [] })
            // User 3
            .mockResolvedValueOnce({ rows: [{ id: 3 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 3 }] })
            .mockResolvedValueOnce({ rows: [] })
            // usuario_sensores insert
            .mockResolvedValueOnce({ rows: [] });

        const response = await request(app).delete('/reset');

        // Verify response
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: "Successfully reset tables with default data"
        });

        // Verify that pool.query was called the expected number of times
        expect(pool.query).toHaveBeenCalledTimes(17);
    });

    test('DELETE /erase debe eliminar todas las tablas', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).delete('/erase');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: "Successfully erased all tables"
        });
    });
});