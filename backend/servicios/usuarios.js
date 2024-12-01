const pool = require('../db');
const {hashPassword, verifyPassword} = require("../utilidades/security");

const usuarios = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new Error("Faltan campos requeridos");
    }

    try {
        // 1. Crear una entrada de actividad
        const actividadResult = await pool.query(`
            INSERT INTO actividad (horas, distancia)
            VALUES (ARRAY[0], ARRAY[0]) RETURNING id
        `);
        const actividadId = actividadResult.rows[0].id;

        // 2. Encriptar la contraseña
        const hashedPassword = await hashPassword(password);

        // 3. Crear el nuevo usuario con la actividad y alerta asociadas
        const newUserResult = await pool.query(`
            INSERT INTO usuarios (username, email, password, actividad_id)
            VALUES ($1, $2, $3, $4) RETURNING email
        `, [username, email, hashedPassword, actividadId]);

        // 4. Creando primero el registro en alertas_usuarios para obtener el ID
        await pool.query(`
            INSERT INTO alertas_usuarios (usuario_email) VALUES ($1) RETURNING id
        `, [email]);

        // 5. Asignar sensores al nuevo usuario en la tabla intermedia
        const newUserEmail = newUserResult.rows[0].email;

        return { message: "User created successfully", email: newUserEmail };
    } catch (err) {
        console.error(err); // Mejora del logging de errores
        throw new Error(err);
    }
};

const sensoresDeUsuarios = async (email) => {
    try {
        const result = await pool.query(`
            SELECT s.uuid, s.id 
            FROM sensores s
            JOIN usuario_sensores us ON s.uuid = us.sensor_uuid
            WHERE us.usuario_email = $1
        `, [email]);

        if (result.rows.length === 0) {
            throw new Error("Usuario no encontrado o sin sensores asignados");
        }

        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

const usuariosAutent = async (email, password) => {
    try {
        // Obtener el usuario de la base de datos
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            throw new Error("Email o contraseña incorrectos");
        }

        const user = userResult.rows[0];

        // Verificar la contraseña
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Email o contraseña incorrectos");
        }

        // Enviar respuesta exitosa
        return { message: "Inicio de sesión exitoso", user };
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

const actualizarUsuarios = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new Error("Todos los campos son obligatorios");
    }

    try {
        const hashedPassword = await hashPassword(password);

        const result = await pool.query(
            'UPDATE usuarios SET username = $1, password = $2 WHERE email = $3',
            [username, hashedPassword, email]
        );

        if (result.rowCount === 0) {
            throw new Error("Usuario no encontrado");
        }

        return { message: "Perfil actualizado correctamente" };
    } catch (err) {
        console.error(err);
        throw new Error("Error interno del servidor: " + err);
    }
};

module.exports = { usuarios, sensoresDeUsuarios, usuariosAutent, actualizarUsuarios };