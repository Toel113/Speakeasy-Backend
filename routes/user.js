const express = require('express');
const router = express.Router();

const { register, getUser } = require('../controller/user');

router.post('/user/register', register);

router.post('/user/getUser', getUser);

module.exports = router;