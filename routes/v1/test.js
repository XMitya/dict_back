/**
 * @swagger
 * components:
 *   schemas:
 *     Phrase:
 *       type: object
 *       required:
 *         - id
 *         - value
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the phrase
 *         value:
 *           type: string
 *           description: Phrase value
 *       example:
 *         id: 5fe9971f-5e0b-4191-a68a-7cd42b9be222
 *         value: hello
 *     TestPhrase:
 *       type: object
 *       properties:
 *         lang:
 *           $ref: '#/components/schemas/Phrase'
 *       example:
 *         en:
 *           id: 5fe9971f-5e0b-4191-a68a-7cd42b9be222
 *           value: hello
 *     CheckPhrase:
 *       type: object
 *       properties:
 *         lang1:
 *           $ref: '#/components/schemas/Phrase'
 *         lang2:
 *           $ref: '#/components/schemas/Phrase'
 *       example:
 *         en:
 *           id: 5fe9971f-5e0b-4191-a68a-7cd42b9be222
 *         ru:
 *           value: привет
 *     CheckResultPhrase:
 *       type: object
 *       properties:
 *         lang1:
 *           $ref: '#/components/schemas/Phrase'
 *         lang2:
 *           type: object
 *           properties:
 *             correctPhrases:
 *               type: array
 *               description: Correct answers
 *               items:
 *                 $ref: '#/components/schemas/Phrase'
 *             checkResult:
 *               type: object
 *               properties:
 *                 enteredValue:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 tries:
 *                   type: integer
 *                 failures:
 *                   type: integer
 *       example:
 *         en:
 *           id: 5fe9971f-5e0b-4191-a68a-7cd42b9be222
 *           value: hello
 *         ru:
 *           correctPhrases:
 *             - id: d636767e-89fe-4c8a-8f85-019107488e1a
 *               value: привет
 *             - id: d636767e-89fe-4c8a-8f85-019107488e1b
 *               value: дарова
 *           checkResult:
 *             enteredValue: привет
 *             success: true
 *             tries: 1
 *             failures: 0
 *
 */

const express = require('express');
const phrasesService = require('../../services/phrases-service')
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PhrasesTest
 *   description: Exam API
 * /v1/phrases:
 *   get:
 *     summary: Get next random phrases with prefer on not checked and with many failures.
 *     tags: [PhrasesTest]
 *     parameters:
 *       - in: query
 *         name: qty
 *         description: Amount of phrases (<= 100). Default 5
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: lang
 *         description: 2 char language code. Default 'en'.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The list of phrases to test
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestPhrase'
 */
router.get('/phrases', async function(req, res, next) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(await phrasesService.phrasesService.getNextRandomPhrases(req.query.qty, req.query.lang))
});


/**
 * @swagger
 * /v1/check:
 *   post:
 *     summary: Verify user answers
 *     tags: [PhrasesTest]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CheckPhrase'
 *     responses:
 *       200:
 *         description: Check results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CheckResultPhrase'
 */
router.post('/check', async function(req, res) {
    const checked = await phrasesService.phrasesService.checkPhrases(req.body)
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(checked)
})

module.exports = router;
