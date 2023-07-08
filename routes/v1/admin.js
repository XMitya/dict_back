const express = require('express');
const phrasesService = require('../../services/phrases-service').phrasesService
const router = express.Router();

/* GET home page. */
router.get('/phrases', async function(req, res, next) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(await phrasesService.getPairs(req.query.srcLang, req.query.tgtLang, req.query.pageSize, req.query.pageNum))
});

router.post('/add-pairs', async function(req, res) {
    const addedPairs = await phrasesService.addPairs(req.body)
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(addedPairs)
})

module.exports = router;
