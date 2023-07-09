/**
 * @swagger
 * components:
 *   schemas:
 *     NoIdPhrase:
 *       type: object
 *       properties:
 *         value:
 *           type: string
 *     PhrasePair:
 *       type: object
 *       properties:
 *         lang1:
 *           $ref: '#/components/schemas/Phrase'
 *         lang2:
 *           $ref: '#/components/schemas/Phrase'
 *       example:
 *         en:
 *           id: 5fe9971f-5e0b-4191-a68a-7cd42b9be222
 *           value: hello
 *         ru:
 *           id: d636767e-89fe-4c8a-8f85-019107488e1a
 *           value: привет
 *     PagedPairs:
 *       type: object
 *       properties:
 *         pairs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PhrasePair'
 *         pageSize:
 *           type: integer
 *           format: int32
 *           example: 10
 *         pageNum:
 *           type: integer
 *           format: int32
 *           example: 0
 *         pages:
 *           type: integer
 *           format: int32
 *           example: 10
 *     NoIdPhrasePair:
 *       type: object
 *       properties:
 *         lang1:
 *           $ref: '#/components/schemas/NoIdPhrase'
 *         lang2:
 *           $ref: '#/components/schemas/NoIdPhrase'
 *       example:
 *         en:
 *           value: hello
 *         ru:
 *           value: привет
 */

const express = require('express');
const phrasesService = require('../../services/phrases-service').phrasesService
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PhrasesAdmin
 *   description: Admin API
 * /v1/admin/phrases:
 *   get:
 *     summary: Get list of phrase pairs
 *     tags: [PhrasesAdmin]
 *     parameters:
 *       - in: query
 *         name: srcLang
 *         description: 2 char source language code
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: tgtLang
 *         description: 2 char target language code. Default 'ru'.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageSize
 *         description: Number of pairs on page
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: pageNum
 *         description: Number of page beginning of 0.
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: The list of phrase pairs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedPairs'
 */
router.get('/phrases', async function(req, res, next) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(await phrasesService.getPairs(req.query.srcLang, req.query.tgtLang, req.query.pageSize, req.query.pageNum))
});


/**
 * @swagger
 * /v1/admin/add-pairs:
 *   post:
 *     summary: Add phrase pairs
 *     tags: [PhrasesAdmin]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/NoIdPhrasePair'
 *     responses:
 *       200:
 *         description: Added phrase pairs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhrasePair'
 */
router.post('/add-pairs', async function(req, res) {
    const addedPairs = await phrasesService.addPairs(req.body)
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(addedPairs)
})


/**
 * @swagger
 * /v1/admin/preload:
 *   post:
 *     summary: Preload phrases from preload_phrases.csv file
 *     tags: [PhrasesAdmin]
 *     responses:
 *       200:
 *         description: Added phrase pairs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.post('/preload', async function(req, res) {
    await phrasesService.preloadPairs()
    res.set({
        'Content-Type': 'application/json'
    })
    res.send({success: true})
})

module.exports = router;
