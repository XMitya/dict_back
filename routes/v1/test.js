const express = require('express');
const phrasesService = require('../../services/phrases-service')
const router = express.Router();
const bodyParser = require('body-parser')

/* GET home page. */
router.get('/phrases', function(req, res, next) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(phrasesService.phrasesService.getNextRandomPhrases())
});

router.post('/check', function(req, res) {
    const checked = phrasesService.phrasesService.checkPhrases(req.body)
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(checked)
})

module.exports = router;
