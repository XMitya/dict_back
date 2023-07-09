const mocks = require("./mocks").mocks;
const db = require("./db").db
const fs = require("fs")
const csvParser = require("csv-parser")

const methods = {
    getNextRandomPhrases: async function (qty, lang) {
        const loaded = await db.nextPhrases(qty, lang)
        return loaded.rows.map(row => {
            const val = {}
            val[row.lang] = {
                id: row.ph_id,
                value: row.value
            }
            return val
        })
    },

    _adjustTestPhrases: phraseToTest => {
        let src = {};
        let tgt = {}
        for (let lang in phraseToTest) {
            if (phraseToTest[lang].id) {
                src = phraseToTest[lang]
                src.language = lang
            } else {
                tgt = phraseToTest[lang]
                tgt.language = lang
            }
        }

        return {
            src: src,
            tgt: tgt
        }
    },

    _buildNotFoundTranslation: tgt => {
        return {
            correctPhrases: [],
            checkResult: {
                enteredValue: tgt.value,
                success: true,
                tries: 1,
                failures: 0
            }
        }
    },

    _sanitizeValue: value => {
        return ('' + value).trim().toLowerCase()
    },

    _existsTranslation: (translations, targetValue) => {
        const sanitized = this.phrasesService._sanitizeValue(targetValue)
        return !!translations.rows.find(row => sanitized === row.tgt_value)
    },

    _checkPhrase: async phraseToTest => {
        const {src, tgt} = this.phrasesService._adjustTestPhrases(phraseToTest)

        // db query
        const translations = await db.findTranslations(src.id, tgt.language)
        const foundTranslations = translations.rowCount > 0

        const res = {}

        if (foundTranslations > 0) {
            src.value = translations.rows[0].src_value
        }

        res[src.language] = {
            id: src.id,
            value: src.value
        }

        if (foundTranslations) {
            const success = this.phrasesService._existsTranslation(translations, tgt.value)
            // Don't care that query and stat update happens in separate transactions.
            const rawStat = await (success
            ? db.setSuccessStat(src.id, tgt.language)
            : db.setFailureStat(src.id, tgt.language))

            const stat = rawStat.rows[0]

            res[tgt.language] = {
                correctPhrases: translations.rows.map(row => {
                    return {
                        id: row.tgt_ph_id,
                        value: row.tgt_value
                    }
                }),
                checkResult: {
                    enteredValue: tgt.value,
                    success: success,
                    tries: stat.tries,
                    failures: stat.failed_tries
                }
            }
        } else { // translation not found
            res[tgt.language] = this.phrasesService._buildNotFoundTranslation(tgt)
        }

        return res
    },

    checkPhrases: async (inputPhrases) => {
        if (inputPhrases) {
            const res = []
            for (let phrase of inputPhrases) {
                const checkResult = await this.phrasesService._checkPhrase(phrase)
                res.push(checkResult)
            }

            return res
        }

        return mocks.checkResult
    },

    getPairs: async (srcLang, tgtLang, pageSize, pageNum) => {
        pageSize = pageSize ?? 10
        pageNum = pageNum ?? 0
        srcLang = srcLang ?? 'en'
        tgtLang = tgtLang ?? 'ru'

        const total = (await db.countPairs(srcLang, tgtLang)).rows[0].cnt
        const pairs = []
        if (total > 0) {
            const loadedPairs = await db.getPairs(srcLang, tgtLang, pageSize, pageNum)
            for (let row of loadedPairs.rows) {
                const pair = {}
                pair[row.src_lang] = {
                    id: row.src_id,
                    value: row.src_value
                }
                pair[row.tgt_lang] = {
                    id: row.tgt_id,
                    value: row.tgt_value
                }
                pairs.push(pair)
            }
        }

        return {
            pairs: pairs,
            pageSize: pageSize,
            pageNum: pageNum,
            pages: Math.ceil(total / pageSize)
        }
    },

    addPairs: async (pairsToAdd) => {
        const addedPairs = []
        for (let pair of pairsToAdd) {
            const langs = []
            for (let lang in pair) {
                langs.push(lang)
            }

            const src = pair[langs[0]]
            const tgt = pair[langs[1]]
            const sanitize = this.phrasesService._sanitizeValue
            const {srcPhrase, tgtPhrase} = await db.addTranslation(sanitize(src.value), langs[0], sanitize(tgt.value), langs[1])
            const addedPair = {}

            for (let phrase of [srcPhrase, tgtPhrase]) {
                const row = phrase.rows[0]
                addedPair[row.lang] = {
                    id: row.ph_id,
                    value: row.value
                }
            }

            addedPairs.push(addedPair)
        }

        return addedPairs
    },

    preloadPairs: async () => {
        const sanitize = this.phrasesService._sanitizeValue
        return fs.createReadStream("preload_phrases.csv")
            .pipe(csvParser())
            .on("data", async pair => {
                await db.addTranslation(sanitize(pair.en), 'en', sanitize(pair.ru), 'ru')
            })
    }
}

exports.phrasesService = methods