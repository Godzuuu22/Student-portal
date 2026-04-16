const db = require('./config/db'); db.execute('DELETE FROM settings WHERE setting_key="sys_background"').then(() => process.exit());
