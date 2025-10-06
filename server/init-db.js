const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('terra.db');

// Crear tablas si no existen
db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT UNIQUE NOT NULL,
        apodo TEXT NOT NULL
    )`);

    // Tabla de rastros/huellas
    db.run(`CREATE TABLE IF NOT EXISTS rastros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        departamento TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);

    console.log('✅ Tablas creadas exitosamente');

    // Verificar que las tablas están vacías
    db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
        console.log(`👤 Usuarios en la BD: ${row.count}`);
    });

    db.get("SELECT COUNT(*) as count FROM rastros", (err, row) => {
        console.log(`👣 Huellas en la BD: ${row.count}`);
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('🔒 Conexión a la BD cerrada.');
});