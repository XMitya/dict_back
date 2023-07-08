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
    },
    findTranslations: async (srcPhraseId, targetLanguage) => {
        const qry = `
                        select
                            p1.ph_id as src_ph_id,
                            p1.lang as src_lang,
                            p1.value as src_value,
                            p2.ph_id as tgt_ph_id,
                            p2.lang as tgt_lang,
                            p2.value as tgt_value
                        from
                            public.translation t
                        join
                            public.phrases p1
                        on
                            t.ph_1_id = p1.ph_id
                        join
                            public.phrases p2
                        on
                            t.ph_2_id = p2.ph_id
                        where
                            t.ph_1_id = $1::uuid and
                            p2.lang = $2
                        union
                        select
                            p1.ph_id as src_ph_id,
                            p1.lang as src_lang,
                            p1.value as src_value,
                            p2.ph_id as tgt_ph_id,
                            p2.lang as tgt_lang,
                            p2.value as tgt_value
                        from
                            public.translation t
                        join
                            public.phrases p1
                        on
                            t.ph_2_id = p1.ph_id
                        join
                            public.phrases p2
                        on
                            t.ph_1_id = p2.ph_id
                        where
                            t.ph_2_id = $1::uuid and
                            p2.lang = $2;
        `

        return await pool.query(qry, [srcPhraseId, targetLanguage])
    }
}