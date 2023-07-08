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
    },

    _setStatAndQuery: async (sql, phraseId, targetLanguage) => {
        const client = await pool.connect()
        try {
            await client.query('begin')
            await client.query(sql, [phraseId, targetLanguage])
            const stats = await client.query("select * from public.stats where ph_id = $1::uuid and target_language = $2;", [phraseId, targetLanguage]);
            await client.query('commit')
            return stats
        } catch (e) {
            await client.query('rollback')
            throw e
        } finally {
            client.release()
        }
    },

    setSuccessStat: async (phraseId, targetLanguage) => {
        const sql = `
                    insert into public.stats (ph_id, target_language, tries, failed_tries)
                    values ($1::uuid, $2, 1, 0)
                    on conflict (ph_id, target_language) do update
                    set
                        tries = stats.tries + 1,
                        updated_at = current_timestamp;
            `
        return await this.db._setStatAndQuery(sql, phraseId, targetLanguage)
    },

    setFailureStat: async (phraseId, targetLanguage) => {
        const sql = `
                    insert into public.stats (ph_id, target_language, tries, failed_tries)
                    values ($1::uuid, $2, 1, 1)
                    on conflict (ph_id, target_language) do update
                    set
                        tries = stats.tries + 1,
                        failed_tries = stats.failed_tries + 1,
                        updated_at = current_timestamp;
            `
        return await this.db._setStatAndQuery(sql, phraseId, targetLanguage)
    }
}