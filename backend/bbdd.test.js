const request = require('supertest');
const app = require('./server');  // Importamos la app del servidor
const pool = require('./db'); // Mockeamos el pool de la base de datos

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

    test('La tabla users debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'users'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'username', data_type: 'character varying', is_nullable: 'NO' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'username', data_type: 'character varying', is_nullable: 'NO' },
        ]);
    });

    test('La tabla sensors debe tener las columnas correctas', async () => {
        // Mock de la estructura de la tabla 'sensors'
        pool.query.mockResolvedValueOnce({
            rows: [
                { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { column_name: 'type', data_type: 'character varying', is_nullable: 'YES' },
                { column_name: 'value', data_type: 'double precision', is_nullable: 'YES' },
                { column_name: 'timestamp', data_type: 'timestamp without time zone', is_nullable: 'YES' },
                { column_name: 'user_id', data_type: 'integer', is_nullable: 'YES' }
            ],
        });

        const response = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'sensors'
        `);

        expect(response.rows).toEqual([
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'type', data_type: 'character varying', is_nullable: 'YES' },
            { column_name: 'value', data_type: 'double precision', is_nullable: 'YES' },
            { column_name: 'timestamp', data_type: 'timestamp without time zone', is_nullable: 'YES' },
            { column_name: 'user_id', data_type: 'integer', is_nullable: 'YES' }
        ]);
    });
});
