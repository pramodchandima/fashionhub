const app = require('./src/app');
const config = require('./src/config/env');
const { initializeDatabase } = require('./src/config/db');

// Start server
initializeDatabase().then(() => {
    app.listen(config.PORT, '0.0.0.0', () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 FashionHub Backend Started Successfully!');
        console.log('='.repeat(50));
        console.log(`📍 Local Access: http://localhost:${config.PORT}`);
        console.log(`🌐 Network Access: http://${config.LOCAL_IP}:${config.PORT}`);
        console.log('📊 API Health: /api/health');
        console.log('📧 Contact Form: /api/contact');
        console.log('🛍️ Products: /api/products');
        console.log('🏪 Categories: /api/categories');
        console.log('🔐 Admin Login: /api/admin/login');
        console.log('='.repeat(50));
        console.log('\n📱 To access from other devices:');
        console.log(`   1. Make sure device is on same WiFi`);
        console.log(`   2. Open browser on other device`);
        console.log(`   3. Go to: http://${config.LOCAL_IP}:3000 (Frontend)`);
        console.log(`   4. Or: http://${config.LOCAL_IP}:${config.PORT} (Backend API)`);
        console.log('='.repeat(50) + '\n');
    });
}).catch(err => {
    console.error('❌ Failed to start server:', err);
});