// backend/db.js
// Kết nối đến SQL Server cho Educity

const sql = require('mssql');

const config = {
    user: 'sa',
    password: '13032005',
    server: 'motchiecmeowber',
    database: 'Educity',
    options: {
        trustServerCertificate: true,
        encrypt: false
  }
};

let poolPromise;

/**
 * Lấy connection pool dùng chung
 */
async function getPool() {
    if (!poolPromise) {
        poolPromise = sql.connect(config)
            .then(pool => {
                console.log("Kết nối database thành công");
                return pool;
            })
            .catch(err => {
                console.error("Lỗi kết nối database:", err.message);
                poolPromise = null; // Reset để thử lại
                throw err;
            });
    }
    return poolPromise;
}

module.exports = {
    sql,
    getPool
};