const pool = require('../db');

const borrarAlertas = async () => {
    try {
        await pool.query('DELETE FROM alertas');
        return { message: "All alerts have been deleted" };
    } catch (err) {
        console.log(err);
        throw new Error("Error borrando alerta: " + err);
    }
};

const borrarAlertasUsuarios = async (email) => {
    try {
        await pool.query(`
            DELETE FROM alertas
            WHERE alertas_usuarios_id IN (
                SELECT id FROM alertas_usuarios WHERE usuario_email = $1
            )
        `, [email]);
        return { message: "All alerts for user ${email} have been deleted" };
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
};

const borrarAlertasEspecificasUsuario = async (email, alertaId) => {
    try {
        const result = await pool.query(`
            DELETE FROM alertas
            WHERE id = $1 AND alertas_usuarios_id IN (
                SELECT id FROM alertas_usuarios WHERE usuario_email = $2
            )
        `, [alertaId, email]);

        if (result.rowCount === 0) {
            throw new Error("Alert not found or does not belong to this user");
        }

        return { message: `Alert with ID ${alertaId} has been deleted for user ${email}.` };
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
};

const getAlertasUsuario = async (email) => {
    try {
        // Consulta para obtener las alertas del usuario por email
        const query = `
            SELECT 
                alertas.codigo,
                alertas.timestamp,
                alertas.location,
                alertas_usuarios.usuario_email
            FROM alertas
            JOIN alertas_usuarios ON alertas.alertas_usuarios_id = alertas_usuarios.id
            WHERE alertas_usuarios.usuario_email = $1
        `;

        const result = await pool.query(query, [email]);

        // Verificar si hay resultados
        if (result.rows.length === 0) {
            throw new Error("No se encontraron alertas para este usuario");
        }

        // Mapear resultados
        const alertas = result.rows.map((row) => ({
            codigo: row.codigo,
            timestamp: row.timestamp,
            location: row.location,
            usuario_email: row.usuario_email,
        }));

        return alertas;
    } catch (err) {
        console.error("Error al obtener las alertas:", err);
        throw new Error("Error interno del servidor: " + err);
    }

};

module.exports = { borrarAlertas, borrarAlertasUsuarios, borrarAlertasEspecificasUsuario, getAlertasUsuario };
