const mocks = require("./mocks").mocks;
const db = require("./db").db

const methods = {
    getNextRandomPhrases: async function (qty, lang) {
        const loaded = await db.nextPhrases(qty, lang)
        console.log(loaded)
        const res = []
        for (let row of loaded.rows) {
            const val = {}
            val[row.lang] = {
                id: row.ph_id,
                value: row.value
            }
            res.push(val)
        }
        console.log(res)
        return res
    },

    checkPhrases: function (inputPhrases) {
        if (inputPhrases) {
            console.log(`Received inputPhrases ${inputPhrases}`)
        } else {
            console.log(`No input received`)
        }
        return mocks.checkResult
    }
}

exports.phrasesService = methods