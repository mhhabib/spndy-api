const express = require('express');
const {
	createExpense,
	getExpenses,
	getExpenseById,
	updateExpense,
	deleteExpense,
} = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All expense routes should be protected
router.use(protect);

router.route('/').post(createExpense).get(getExpenses);

router
	.route('/:id')
	.get(getExpenseById)
	.put(updateExpense)
	.delete(deleteExpense);

module.exports = router;
