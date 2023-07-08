const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dictionary',
    password: 'postgres', // todo read from .env file
    port: 5432,
})

exports.db = {
    nextPhrases: async (qty, lang) => {
        qty = qty ? qty : 5
        lang = lang ? lang : 'en'
        return await pool.query("select * from public.phrases where lang = $1 limit $2", [lang, qty])
    }
}