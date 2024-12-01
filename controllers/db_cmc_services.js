const connection = require('../util/db');

module.exports = {
    createCoinPriceService: (coinName, usdPrice) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(usdPrice == NULL) resolve([]);

                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO coin_price (coin_name, usd_price) values ( ?, ? )`, 
                        [coinName, usdPrice],
                        (err, results, fields) => {
                            if(err) reject(err);
                            resolve(results);
                    });
                    connection.releaseConnection(conn);
                })
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    },
    getPriceService: (symbol) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if (err) {
                        return reject(err); // Reject the promise with the error
                    }
                    conn.query(
                        `SELECT *
                        FROM coin_price
                        WHERE coin_name = ?
                        ORDER BY timestamp DESC
                        LIMIT 1;`,
                        [symbol],
                        (err, results, fields) => {
                            // Release the connection before resolving or rejecting
                            conn.release();
                            if (err) {
                                return reject(err); // Reject the promise with the error
                            }
                            resolve(results); // Resolve the promise with the query results
                    });
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    },  
}
