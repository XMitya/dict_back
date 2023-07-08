const mocks = require("./mocks");

const methods = {
    getNextRandomPhrases: function () {
        return mocks.mocks.phrases
    },

    checkPhrases: function (inputPhrases) {
        if (inputPhrases) {
            console.log(`Received inputPhrases ${inputPhrases}`)
        } else {
            console.log(`No input received`)
        }
        return mocks.mocks.checkResult
    }
}

exports.phrasesService = methods