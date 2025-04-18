const express = require('express');
const {
	getMonthlyExpense,
	getMonthlyExpenseList,
	getYearlyExpense,
	getDateRangeExpense,
	getMyDateRangeExpense
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/monthly/:year/:month').get(getMonthlyExpense);
router.route('/monthly/list/:year/:month').get(getMonthlyExpenseList);
router.route('/yearly/:year').get(getYearlyExpense);
router.route('/range').get(getDateRangeExpense);

router.route('/myexpense/range').get(protect, getMyDateRangeExpense);

module.exports = router;
