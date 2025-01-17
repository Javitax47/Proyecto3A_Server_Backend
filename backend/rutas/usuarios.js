const express = require('express');
const { usuarios, sensoresDeUsuarios, usuariosAutent, actualizarUsuarios, verificarToken, verificarActualizacion, actualizarContrasena, usuarioAdmin, infoUsers } = require('../servicios/usuarios');

const router = express.Router();

router.post('/usuarios', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const result = await usuarios(username, email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/usuarios/:email/sensores', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await sensoresDeUsuarios(email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/usuarios/login/:email/:password', async (req, res) => {
    const { email, password } = req.params;
    try {
        const result = await usuariosAutent(email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.put('/users/update', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await actualizarUsuarios(username, email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.put('/users/updatePass', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await actualizarContrasena(email, password);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/token/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await verificarToken(token);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/verificar-actualizacion/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await verificarActualizacion(token);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/esAdmin/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await usuarioAdmin(email);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get('/infoUsers', async (req, res) => {
    try {
        const result = await infoUsers();
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario existe y obtener el estado (habilitado/deshabilitado)
        const result = await pool.query(
            'SELECT email, password, activo FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const user = result.rows[0];

        // Verificar si la cuenta está deshabilitada
        if (!user.activo) {
            return res.status(403).json({ error: 'La cuenta está deshabilitada. Contacta al administrador.' });
        }

        // Verificar contraseña (usando bcrypt o similar)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Generar y devolver un token JWT (si lo usas)
        const token = generateJWT(user.email);
        return res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/toggleUserStatus', async (req, res) => {
    const { email, activo } = req.body;

    try {
        // Actualizar el estado del usuario en la base de datos
        await pool.query('UPDATE usuarios SET activo = $1 WHERE email = $2', [activo, email]);
        return res.status(200).send({ message: 'Estado del usuario actualizado correctamente.' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Error al actualizar el estado del usuario.' });
    }
});

module.exports = router;