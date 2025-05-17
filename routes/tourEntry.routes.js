const express = require('express');
const {
	createEntry,
	updateEntry,
	deleteEntry,
} = require('../controllers/tourEntry.controller');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').post(createEntry);
router.route('/:entryId').put(updateEntry);
router.route('/:tourId/:entryId').delete(deleteEntry);

module.exports = router;
