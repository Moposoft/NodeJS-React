var express = require('express');
var router = express.Router();
var apiRouter  = require('../routes/apiRouter');
var indexRouter  = require('../routes/indexRouter');

router.use('/api', apiRouter);
router.use('/', indexRouter);



module.exports = router;