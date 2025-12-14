const sql = require('mssql');

const config = {
    user: 'sa',
    password: '13032005',
    server: 'NHUNGUYEN',
    database: 'Educity',
    options: {
        trustServerCertificate: true,
        encrypt: false
  }
};

let poolPromise;

async function getPool() {
    if (!poolPromise) {
        poolPromise = sql.connect(config)
            .then(pool => {
                console.log("Kết nối database thành công");
                return pool;
            })
            .catch(err => {
                console.error("Lỗi kết nối database:", err.message);
                poolPromise = null; // Reset
                throw err;
            });
    }
    return poolPromise;
}

module.exports = {
    sql,
    getPool
};