const { Op } = require('sequelize');
const Expense = require('../models/expense.model');
const Category = require('../models/category.model');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
	try {
		const { description, categoryId, amount, date } = req.body;
		// Check if category exists
		const category = await Category.findByPk(categoryId);
		if (!category) {
			return res.status(400).json({ message: 'Category not found' });
		}

		const expense = await Expense.create({
			description,
			CategoryId: categoryId,
			amount,
			date: date || new Date(),
			UserId: req.user.id,
		});

		const fullExpense = await Expense.findByPk(expense.id, {
			include: [Category],
		});
		res.status(201).json(fullExpense);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
	try {
		const expenses = await Expense.findAll({
			where: { userId: req.user.id },
			include: [Category],
			order: [['date', 'DESC']],
		});
		res.json(expenses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get an expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
	try {
		const expense = await Expense.findOne({
			where: {
				id: req.params.id,
				userId: req.user.id,
			},
			include: [Category],
		});

		if (expense) {
			res.json(expense);
		} else {
			res.status(404).json({ message: 'Expense not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
	try {
		const { description, categoryId, amount, date } = req.body;

		// Check if category exists
		if (categoryId) {
			const category = await Category.findByPk(categoryId);
			if (!category) {
				return res.status(400).json({ message: 'Category not found' });
			}
		}

		const expense = await Expense.findOne({
			where: {
				id: req.params.id,
				UserId: req.user.id,
			},
		});

		if (expense) {
			expense.description = description || expense.description;
			expense.categoryId = categoryId || expense.categoryId;
			expense.amount = amount || expense.amount;
			expense.date = date || expense.date;

			await expense.save();

			const updatedExpense = await Expense.findByPk(expense.id, {
				include: [Category],
			});

			res.json(updatedExpense);
		} else {
			res.status(404).json({ message: 'Expense not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
	try {
		const expense = await Expense.findOne({
			where: {
				id: req.params.id,
				UserId: req.user.id,
			},
		});

		if (expense) {
			await expense.destroy();
			res.json({ message: 'Expense removed' });
		} else {
			res.status(404).json({ message: 'Expense not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	createExpense,
	getExpenses,
	getExpenseById,
	updateExpense,
	deleteExpense,
};
