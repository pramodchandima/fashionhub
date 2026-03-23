const { getPool, initializeDatabase } = require('../src/config/db');

async function migrate() {
    try {
        // Initialize pool
        await initializeDatabase();
        const pool = getPool();
        const connection = await pool.getConnection();

        console.log('🔄 Starting migration...');

        try {
            // Check if columns exist (simplified by just trying to add them)
            // Using IDEMPOTENT queries or catching errors

            const queries = [
                "ALTER TABLE orders ADD COLUMN customer_email VARCHAR(100);",
                "ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);",
                "ALTER TABLE orders ADD COLUMN shipping_address TEXT;"
            ];

            for (const query of queries) {
                try {
                    await connection.query(query);
                    console.log(`✅ Executed: ${query}`);
                } catch (err) {
                    if (err.code === 'ER_DUP_FIELDNAME') {
                        console.log(`ℹ️ Column already exists, skipping: ${query}`);
                    } else {
                        throw err;
                    }
                }
            }

            console.log('🎉 Migration completed successfully!');

        } catch (error) {
            console.error('❌ Migration failed:', error);
        } finally {
            connection.release();
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

migrate();
