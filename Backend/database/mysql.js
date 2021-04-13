var mysql = require('mysql');
const dotenv = require('dotenv');
const value = dotenv.config();
console.log(value);

const dbConfig = {
    connectionLimit: 20,
    host: "127.0.0.1",
    user: "root",
    password: "poonam2802",
    database: "SplitwiseDb"
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME
};

const pool = mysql.createPool(dbConfig);
export const connection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err);
            console.log("MySQL pool connected: threadId " + connection.threadId);
            const query = (sql, binding) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, binding, (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            };
            const release = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL pool released: threadId " + connection.threadId);
                    resolve(connection.release());
                });
            };
            const commit = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL commit succeed");
                    resolve(connection.commit());
                });
            };
            const rollback = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL rollback success");
                    resolve(connection.rollback());
                });
            };
            const beginTransaction = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL beginTransaction");
                    resolve(connection.beginTransaction());
                });
            };
            resolve({ query, release, commit, rollback, beginTransaction });
        });
    });
};
export const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, binding, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};
