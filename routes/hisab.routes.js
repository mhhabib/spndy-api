const express = require('express');
const {
	createHisab,
	getHisabs,
	getHisabById,
	updateHisab,
	deleteHisab,
} = require('../controllers/hisab.controller');

const router = express.Router();

router.route('/').post(createHisab).get(getHisabs);
router.route('/:id').get(getHisabById).put(updateHisab).delete(deleteHisab);
module.exports = router;
