const connection = require('../util/db');

module.exports = {
    createLendingPoolService: (poolId, currency, network, block, tx) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO lending_pools (pool_id, currency, network, status, block, transaction_hash) values ( ?, ?, ?, 1, ?, ? )`, 
                        [poolId, currency, network, block, tx],
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
    createLendingLendService: (poolId, lender, currencyAmount, pairingAmount, block, tx, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO lending_lends (pool_id, lender, currency_amount, pairing_amount, block, transaction_hash, network) values ( ?, ?, ?, ?, ?, ?, ? )`, 
                        [poolId, lender, currencyAmount, pairingAmount, block, tx, network],
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
    createLendingBorrowService: (poolId, borrower, amount, block, tx, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO lending_borrows (pool_id, borrower, amount, block, transaction_hash, network) values ( ?, ?, ?, ?, ?, ? )`, 
                        [poolId, borrower, amount, block, tx, network],
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
    createLendingRepaymentService: (poolId, borrower, amount, block, tx, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO lending_repayments (pool_id, borrower, amount, block, transaction_hash, network) values ( ?, ?, ?, ?, ?, ? )`, 
                        [poolId, borrower, amount, block, tx, network],
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
    createLendingClaimInterestService: (poolId, lender, amountInterest, amountPrincipal, block, tx, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO lending_claims (pool_id, lender, interest_amount, principal_amount, block, transaction_hash, network) values ( ?, ?, ?, ?, ?, ?, ? )`, 
                        [poolId, lender, amountInterest, amountPrincipal, block, tx, network],
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
    updatePoolService: (poolId, status, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `UPDATE lending_pools SET status = ? where pool_id = ? and network = ?`,
                        [status, poolId, network],
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
    getPoolService: (status) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if (err) {
                        return reject(err); // Reject the promise with the error
                    }
                    conn.query(
                        'SELECT pool_id, currency, network FROM `lending_pools` WHERE status = ?',
                        [status],
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
    getPoolActivitiesService: (poolId, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `SELECT block, transaction_hash, '' as address, '' as amount, 'Create' AS event
                        FROM lending_pools 
                        WHERE pool_id = ? AND network = ?
                        
                        UNION ALL
                        
                        SELECT block, transaction_hash, lender, currency_amount, 'Lend' AS event
                        FROM lending_lends 
                        WHERE pool_id = ? AND network = ?
                        
                        UNION ALL
                        
                        SELECT block, transaction_hash, borrower, amount, 'Borrow' AS event
                        FROM lending_borrows 
                        WHERE pool_id = ? AND network = ?
                        
                        UNION ALL
                        
                        SELECT block, transaction_hash, borrower, amount, 'Repay' AS event
                        FROM lending_repayments 
                        WHERE pool_id = ? AND network = ?
                        
                        UNION ALL
                        
                        SELECT block, transaction_hash, lender, interest_amount + principal_amount, 'Claim' AS event
                        FROM lending_claims 
                        WHERE pool_id = ? AND network = ?
                        
                        ORDER BY block DESC;`,
                        [poolId, network, poolId, network, poolId, network, poolId, network, poolId, network],
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
    getUserPoolsService: (address) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `SELECT DISTINCT lending_pools.pool_id, lending_pools.currency, lending_pools.network
                        FROM lending_lends
                        LEFT JOIN lending_pools ON lending_lends.pool_id = lending_pools.id
                        WHERE lending_lends.lender = ?
                        AND lending_pools.status < 3`,
                        [address],
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
    }
}
