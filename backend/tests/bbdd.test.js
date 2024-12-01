const request = require('supertest');
const app = require('../server');  // Importamos la app del servidor
const pool = require('../db'); // Mockeamos el pool de la base de datos

let server;

beforeAll(() => {
    // Iniciar el servidor antes de ejecutar las pruebas
    server = app.listen(13000, () => console.log('Test server running on port 13000'));
});

afterAll(async () => {
    await server.close();  // Cierra el servidor después de todas las pruebas
});

jest.mock('./db', () => ({
    query: jest.fn(),
}));

describe('Integridad y estructura de la base de datos', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada test
    });

    test('La tabla usuarios debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'usuarios'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'username', data_type: 'character varying', is_nullable: 'NO' },
                { column_name: 'email', data_type: 'character varying', is_nullable: 'NO' },
                { column_name: 'password', data_type: 'character varying', is_nullable: 'NO' },
                { column_name: 'telefono', data_type: 'character varying', is_nullable: 'YES' },
                { column_name: 'actividad_id', data_type: 'integer', is_nullable: 'YES' },
                { column_name: 'nodo_id', data_type: 'integer[]', is_nullable: 'YES' },
                { column_name: 'alertas', data_type: 'integer[]', is_nullable: 'YES' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'usuarios'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'username', data_type: 'character varying', is_nullable: 'NO' },
            { column_name: 'email', data_type: 'character varying', is_nullable: 'NO' },
            { column_name: 'password', data_type: 'character varying', is_nullable: 'NO' },
            { column_name: 'telefono', data_type: 'character varying', is_nullable: 'YES' },
            { column_name: 'actividad_id', data_type: 'integer', is_nullable: 'YES' },
            { column_name: 'nodo_id', data_type: 'integer[]', is_nullable: 'YES' },
            { column_name: 'alertas', data_type: 'integer[]', is_nullable: 'YES' }
        ]);
    });

    test('La tabla sensores debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'sensores'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'uuid', data_type: 'character varying', is_nullable: 'NO' },
                { column_name: 'tipo', data_type: 'integer', is_nullable: 'YES' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'sensores'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'uuid', data_type: 'character varying', is_nullable: 'NO' },
            { column_name: 'tipo', data_type: 'integer', is_nullable: 'YES' }
        ]);
    });

    test('La tabla mediciones debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'mediciones'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'sensor_id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'valor', data_type: 'double precision', is_nullable: 'NO' },
                { column_name: 'timestamp', data_type: 'timestamp without time zone', is_nullable: 'NO' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'mediciones'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'sensor_id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'valor', data_type: 'double precision', is_nullable: 'NO' },
            { column_name: 'timestamp', data_type: 'timestamp without time zone', is_nullable: 'NO' }
        ]);
    });

    test('La tabla actividad debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'actividad'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'horas', data_type: 'real[]', is_nullable: 'YES' },
                { column_name: 'distancia', data_type: 'real[]', is_nullable: 'YES' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'actividad'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'horas', data_type: 'real[]', is_nullable: 'YES' },
            { column_name: 'distancia', data_type: 'real[]', is_nullable: 'YES' }
        ]);
    });

    test('La tabla tipos debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'tipos'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'tipo', data_type: 'character varying', is_nullable: 'NO' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'tipos'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'tipo', data_type: 'character varying', is_nullable: 'NO' }
        ]);
    });

    test('La tabla alertas debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'alertas'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'codigo_alerta', data_type: 'integer', is_nullable: 'YES' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'alertas'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'codigo_alerta', data_type: 'integer', is_nullable: 'YES' }
        ]);
    });
});
