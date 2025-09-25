const express = require('express');
const {
	createLedger,
	getLedgers,
	getLedgerById,
	updateLedger,
	deleteLedger,
} = require('../controllers/ledger.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.route('/').post(createLedger).get(getLedgers);
router.route('/:id').get(getLedgerById).put(updateLedger).delete(deleteLedger);
module.exports = router;
