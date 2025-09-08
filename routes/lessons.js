const express = require('express');
const router = express.Router();

const { getAllCategory, setVocabulary, setSentences, setListening, getDataCategory, setExamScore } = require('../controller/lessons');

router.post('/lessons/getAllCategory', getAllCategory);

router.post('/setlessons/setVocabulary', setVocabulary);

router.post('/setlessons/setSentences', setSentences);

router.post('/setlessons/setListening', setListening);

router.post('/getLessons/getDataCategory', getDataCategory);

router.post('/setExam/setExamScore', setExamScore);

module.exports = router;