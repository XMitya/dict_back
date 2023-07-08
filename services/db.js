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
        qty = qty ?? 5
        lang = lang ?? 'en'
        const sql = `
            with random_rows as (select
                *
            from
                public.phrases
            where
                lang = $1
            order by random()
            limit
                100)

            select
                rr.*
            from
                random_rows rr
            left join
                stats s
            on
                s.ph_id = rr.ph_id
            order by
                (s.tries / s.failed_tries) nulls first
            limit $2;
        `

        return await pool.query(sql, [lang, qty])
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
    },

    _getOrUpdatePhrase: async (client, phrase, lang) => {
        const phraseSql = `select * from public.phrases where value = $1 and lang = $2`
        const phraseInsertSql = `insert into public.phrases(lang, value) VALUES ($2, $1);`
        let loaded = await client.query(phraseSql, [phrase, lang])

        if (loaded.rowCount === 0) {
            await client.query(phraseInsertSql, [phrase, lang])
            loaded = await client.query(phraseSql, [phrase, lang])
        }

        return loaded
    },

    _getOrCreateTranslation: async (client, ph1Id, ph2Id) => {
        const sql = `select * from public.translation where 
                                     ph_1_id = $1::uuid and ph_2_id = $2::uuid or 
                                               ph_2_id = $1::uuid and ph_1_id = $2::uuid;`

        let loaded = await client.query(sql, [ph1Id, ph2Id])
        if (loaded.rowCount === 0) {
            await client.query(`insert into public.translation (ph_1_id, ph_2_id) VALUES ($1::uuid, $2::uuid);`, [ph1Id, ph2Id])
            loaded = await client.query(sql, [ph1Id, ph2Id])
        }

        return loaded
    },

    // admin functions
    addTranslation: async (srcPhrase, srcLang, tgtPhrase, tgtLang) => {
        const client = await pool.connect()
        try {
            await client.query('begin')
            const srcRes = await this.db._getOrUpdatePhrase(client, srcPhrase, srcLang)
            const tgtRes = await this.db._getOrUpdatePhrase(client, tgtPhrase, tgtLang)

            await this.db._getOrCreateTranslation(client, srcRes.rows[0].ph_id, tgtRes.rows[0].ph_id)
            await client.query('commit')
            return {
                srcPhrase: srcRes,
                tgtPhrase: tgtRes
            }
        } catch (e) {
            await client.query('rollback')
        } finally {
            client.release()
        }
    },

    getPairs: async (srcLang, tgtLang, pageSize, pageNum) => {
        const sql = `
            select
                src.ph_id as src_id,
                src.value as src_value,
                src.lang as src_lang,
                tgt.ph_id as tgt_id,
                tgt.value as tgt_value,
                tgt.lang as tgt_lang
            from
                public.phrases src
            join
                public.translation tr
            on
                src.ph_id in (tr.ph_1_id, tr.ph_2_id)
            join
                public.phrases tgt
            on
                tgt.ph_id in (tr.ph_1_id, tr.ph_2_id)
            where
                src.lang = $1 and
                tgt.lang = $2 and
                src.ph_id != tgt.ph_id
            order by src.value
                limit $3 offset $4;
        `

        const offset = pageSize * pageNum

        return await pool.query(sql, [srcLang, tgtLang, pageSize, offset])
    },

    countPairs: async(srcLang, tgtLang) => {
        const sql = `
            select
                count(1) as cnt
            from
                public.phrases src
            join
                public.translation tr
            on
                src.ph_id in (tr.ph_1_id, tr.ph_2_id)
            join
                public.phrases tgt
            on
                tgt.ph_id in (tr.ph_1_id, tr.ph_2_id)
            where
                src.lang = $1 and
                tgt.lang = $2 and
                src.ph_id != tgt.ph_id
        `

        return await pool.query(sql, [srcLang, tgtLang])
    },
}