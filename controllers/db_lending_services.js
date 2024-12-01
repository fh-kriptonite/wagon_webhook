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
                        `INSERT INTO lending_pools (pool_id, currency, network, status, block, transaction_hash, type)
                        VALUES (?, ?, ?, 1, ?, ?, "")
                        ON DUPLICATE KEY UPDATE 
                            currency = VALUES(currency),
                            network = VALUES(network),
                            status = VALUES(status),
                            block = VALUES(block),
                            transaction_hash = VALUES(transaction_hash);`, 
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
    repaymentUpdatePoolService: (poolId, amount, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }

                    conn.query(`SELECT SUM(currency_amount) as totalAmount FROM lending_lends WHERE pool_id = ?`,
                        [poolId],
                        (err, results) => {
                            if(err) {
                                connection.releaseConnection(conn);
                                throw err;
                            }

                            const totalAmount = results[0].totalAmount;

                            if(totalAmount <= amount) {
                                conn.query(
                                    `UPDATE lending_pools SET status = 3 where pool_id = ? and network = ?`,
                                    [poolId, network],
                                    (err, updateResults, fields) => {
                                        if(err) reject(err);
                                        resolve(updateResults);
                                });
                            }
                        }
                    )
                    
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
    },
    createLendingBalanceService: (poolId, lender, balance, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if(err) {
                        connection.releaseConnection(conn);
                        throw err;
                    }
                    conn.query(
                        `INSERT INTO lending_balances (pool_id, lender, balance, network)
                            VALUES (?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                balance = balance + VALUES(balance);`, 
                        [poolId, lender, balance, network],
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
    updateLendingBalanceService: (poolId, lender, balance, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if (err) {
                        connection.releaseConnection(conn);
                        return reject(err);
                    }
    
                    // First, attempt to update the row
                    conn.query(
                        `UPDATE lending_balances 
                        SET balance = CAST(balance AS SIGNED) + ? 
                        WHERE pool_id = ? AND lender = ? AND network = ?`, 
                        [balance, poolId, lender, network],
                        (err, results) => {
                            if (err) {
                                connection.releaseConnection(conn);
                                return reject(err);
                            }
    
                            // Check if any rows were affected by the update
                            if (results.affectedRows === 0) {
                                // If no rows were updated, insert a new row
                                conn.query(
                                    `INSERT INTO lending_balances (pool_id, lender, balance, network) 
                                    VALUES (?, ?, ?, ?)`, 
                                    [poolId, lender, balance, network],
                                    (err, results) => {
                                        connection.releaseConnection(conn);
                                        if (err) return reject(err);
                                        resolve(results);
                                    }
                                );
                            } else {
                                // If the update succeeded, return the results
                                connection.releaseConnection(conn);
                                resolve(results);
                            }
                        }
                    );
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    },
    updatePrincipalLendingBalanceService: (poolId, lender, balance, network) => {
        return new Promise(async (resolve, reject) => {
            try {
                connection.getConnection(function(err, conn) {
                    if (err) {
                        connection.releaseConnection(conn);
                        return reject(err);
                    }
    
                    // First, attempt to update the row
                    conn.query(
                        `UPDATE lending_balances 
                        SET balance = ? 
                        WHERE pool_id = ? AND lender = ? AND network = ?`, 
                        [balance, poolId, lender, network],
                        (err, results) => {
                            if (err) {
                                connection.releaseConnection(conn);
                                return reject(err);
                            }
                        }
                    );
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }    
}
