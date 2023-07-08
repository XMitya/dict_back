const express = require('express');
const phrasesService = require('../../services/phrases-service')
const router = express.Router();

/* GET home page. */
router.get('/phrases', async function(req, res, next) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(await phrasesService.phrasesService.getNextRandomPhrases(req.query.qty, req.query.lang))
});

router.post('/check', async function(req, res) {
    const checked = await phrasesService.phrasesService.checkPhrases(req.body)
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(checked)
})

module.exports = router;
