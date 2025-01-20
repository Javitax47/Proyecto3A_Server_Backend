/**
 * @file usuariosService.js
 * @brief Funciones para gestionar usuarios en la base de datos.
 * 
 * Este módulo contiene funciones para la creación, autenticación, actualización y verificación de usuarios,
 * así como la asociación de usuarios con sensores y la gestión de privilegios de administrador.
 */

const pool = require('../db');
const { hashPassword, verifyPassword } = require("../utilidades/security");
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

/**
 * @brief Crea un nuevo usuario en la base de datos y envía un correo de verificación.
 * 
 * @param {string} username - Nombre del usuario.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al crear el usuario o enviar el correo de verificación.
 */
const usuarios = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new Error("Faltan campos requeridos");
    }

    try {
        const actividadResult = await pool.query(`
            INSERT INTO actividad (horas, distancia)
            VALUES (ARRAY[0], ARRAY[0]) RETURNING id
        `);
        const actividadId = actividadResult.rows[0].id;

        const hashedPassword = await hashPassword(password);

        const verificationToken = uuidv4(); // Generar token único

        await pool.query(`
            INSERT INTO usuarios (username, email, password, actividad_id, verification_token)
            VALUES ($1, $2, $3, $4, $5)
        `, [username, email, hashedPassword, actividadId, verificationToken]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'airmonitorgti@gmail.com',
                pass: 'dkui ohpz hxrz rzzx',
            },
        });

        const verificationUrl = `https://airmonitor.com/${verificationToken}`;

        const mailOptions = {
            from: 'airmonitorgti@gmail.com',
            to: email,
            subject: 'Verificación de correo electrónico',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c3e50;">¡Hola ${username}!</h2>
                    <p>Gracias por registrarte en nuestra plataforma. Para completar el proceso de registro, es necesario que verifiques tu dirección de correo electrónico.</p>
                    <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${verificationUrl}" style="background-color: #3498db; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verificar mi cuenta
                        </a>
                    </p>
                    <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
                    <p style="word-break: break-word;">
                        <a href="${verificationUrl}" style="color: #3498db;">${verificationUrl}</a>
                    </p>
                    <p>Si no realizaste esta solicitud, por favor ignora este mensaje.</p>
                    <p>Saludos cordiales,</p>
                    <p><strong>El equipo de AirMonitor GTI</strong></p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return { message: "User created successfully. Verification email sent." };
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

/**
 * @brief Obtiene los sensores asociados a un usuario.
 * 
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Array} Lista de sensores asociados al usuario.
 * @throws {Error} Error al obtener los sensores o si el usuario no tiene sensores asignados.
 */
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

/**
 * @brief Autentica a un usuario.
 * 
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Object} Datos del usuario autenticado.
 * @throws {Error} Error si las credenciales son incorrectas o la cuenta no está verificada.
 */
const usuariosAutent = async (email, password) => {
    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            throw new Error("Email o contraseña incorrectos");
        }
        const user = userResult.rows[0];
        if (!user.is_verified) {
            throw new Error("Please verify your account to log in");
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Email o contraseña incorrectos");
        }

        return user;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

/**
 * @brief Actualiza la información de un usuario y envía un correo de confirmación.
 * 
 * @param {string} username - Nuevo nombre de usuario.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Nueva contraseña del usuario.
 * @returns {Object} Mensaje de éxito.
 * @throws {Error} Error al actualizar la información del usuario o enviar el correo de confirmación.
 */
const actualizarUsuarios = async (username, email, password) => {
    try {
        const hashedPassword = await hashPassword(password);
        const verificationToken = uuidv4(); // Generar un token único

        const result = await pool.query(
            'UPDATE usuarios SET username = $1, password = $2, verification_token = $3, is_verified = FALSE WHERE email = $4 RETURNING email',
            [username, hashedPassword, verificationToken, email]
        );

        if (result.rowCount === 0) {
            throw new Error("Usuario no encontrado");
        }

        const verificationUrl = `https://airmonitor.com/verify-update/${verificationToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'airmonitorgti@gmail.com',
                pass: 'dkui ohpz hxrz rzzx',
            },
        });

        const mailOptions = {
            from: 'airmonitorgti@gmail.com',
            to: email,
            subject: 'Confirmación de actualización de perfil',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c3e50;">Hola ${username},</h2>
                    <p>Has solicitado realizar una actualización en tu perfil. Para confirmar estos cambios, por favor haz clic en el siguiente enlace:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${verificationUrl}" style="background-color: #3498db; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Confirmar actualización
                        </a>
                    </p>
                    <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
                    <p style="word-break: break-word;">
                        <a href="${verificationUrl}" style="color: #3498db;">${verificationUrl}</a>
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return { message: "Perfil actualizado. Verifica tu correo electrónico para confirmar los cambios." };
    } catch (err) {
        console.error(err);
        throw new Error("Error interno del servidor: " + err);
    }
};

module.exports = { usuarios, sensoresDeUsuarios, usuariosAutent, actualizarUsuarios };
