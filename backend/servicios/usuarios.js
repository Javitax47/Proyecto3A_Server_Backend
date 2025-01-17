const pool = require('../db');
const {hashPassword, verifyPassword} = require("../utilidades/security");
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

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
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            throw new Error("Email o contraseña incorrectos");
        }
        const user = userResult.rows[0];
        console.log('Estado de verificación:', user.is_verified);
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


const actualizarUsuarios = async (username, email, password) => {
    try {
        const hashedPassword = await hashPassword(password);
        const verificationToken = uuidv4(); // Generar un token único

        // Actualizar el usuario y guardar el token temporalmente
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
                    <p>Si no realizaste esta solicitud, por favor ignora este mensaje. Por seguridad, te recomendamos que revises tu cuenta y actualices tu contraseña si sospechas de actividad no autorizada.</p>
                    <p>Saludos cordiales,</p>
                    <p><strong>El equipo de AirMonitor GTI</strong></p>
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

const actualizarContrasena = async (email, password) => {
    try {
        // Obtener el username de la base de datos usando el email
        const userResult = await pool.query(
            'SELECT username FROM usuarios WHERE email = $1',
            [email]
        );

        if (userResult.rowCount === 0) {
            throw new Error("Usuario no encontrado");
        }

        const username = userResult.rows[0].username; // Tomar el username de la base de datos
        const hashedPassword = await hashPassword(password);
        const verificationToken = uuidv4(); // Generar un token único

        // Actualizar el usuario y guardar el token temporalmente
        const result = await pool.query(
            'UPDATE usuarios SET password = $1, verification_token = $2, is_verified = FALSE WHERE email = $3 RETURNING email',
            [hashedPassword, verificationToken, email]
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
                    <p>Si no realizaste esta solicitud, por favor ignora este mensaje. Por seguridad, te recomendamos que revises tu cuenta y actualices tu contraseña si sospechas de actividad no autorizada.</p>
                    <p>Saludos cordiales,</p>
                    <p><strong>El equipo de AirMonitor GTI</strong></p>
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


// Endpoint para verificar el token de actualización
const verificarActualizacion = async (token) => {
    try {
        // Buscar el token en la base de datos
        const checkTokenQuery = await pool.query(
            'SELECT * FROM usuarios WHERE verification_token = $1',
            [token]
        );

        if (checkTokenQuery.rows.length === 0) {
            return { message: "Token inválido o expirado" };
        }

        // Confirmar la actualización y eliminar el token
        const result = await pool.query(
            'UPDATE usuarios SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1',
            [token]
        );

        if (result.rowCount === 0) {
            return { message: "Token inválido o expirado" };
        }
        return { message: "Perfil actualizado exitosamente." };
    } catch (err) {
        console.error('Error en verificarActualizacion:', err);
        throw new Error("Error interno del servidor: " + err);
    }
};



const verificarToken = async (token) => {
    try {
        console.log('Token recibido para verificación:', token);

        // Primero, verificar si el token existe
        const checkTokenQuery = await pool.query(
            'SELECT * FROM usuarios WHERE verification_token = $1',
            [token]
        );

        console.log('Resultado de búsqueda de token:', checkTokenQuery.rows);

        if (checkTokenQuery.rows.length === 0) {
            console.log('Token no encontrado en la base de datos');
            return { message: "Invalid or expired token" };
        }

        const result = await pool.query(
            'UPDATE usuarios SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING email',
            [token]
        );

        console.log('Resultado de actualización:', result);

        if (result.rowCount === 0) {
            return { message: "Invalid or expired token" };
        }
        return { message: "Account verified successfully. You can now log in." };
    } catch (err) {
        console.error('Error en verificarToken:', err);
        throw new Error("Error interno del servidor: " + err);
    }
};

const usuarioAdmin = async (email) => {
    try {
        const userResult = await pool.query('SELECT admin FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            throw new Error("Email o contraseña incorrectos");
        }

        return userResult;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

const infoUsers = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                u.username AS usuario, 
                u.email AS correo,
                u.active AS activo,
                s.uuid AS sensor,
                m.valor AS ultima_medicion,
                m.timestamp AS fecha
            FROM usuarios u
            JOIN usuario_sensores us ON u.email = us.usuario_email
            JOIN sensores s ON us.sensor_uuid = s.uuid
            LEFT JOIN mediciones m ON s.uuid = m.sensor_id
            WHERE m.timestamp = (
                SELECT MAX(med.timestamp) 
                FROM mediciones med
                WHERE med.sensor_id = s.uuid
            )
            ORDER BY u.username;
        `);

        return result.rows;
    } catch (err) {
        console.log(err);
        throw new Error("Error recogiendo los usuarios: " + err);
    }
};

module.exports = { usuarios, sensoresDeUsuarios, usuariosAutent, actualizarUsuarios, verificarToken, verificarActualizacion, actualizarContrasena, usuarioAdmin, infoUsers };