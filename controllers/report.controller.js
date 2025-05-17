const { Op, fn, col, literal, UUID } = require('sequelize');
const Expense = require('../models/expense.model');
const { Entry } = require('../models');
const Category = require('../models/category.model');
const User = require('../models/user.model');

// @desc    Get monthly expense summary
// @route   GET /api/reports/monthly/:year/:month
// @access  Private
const getMonthlyExpense = async (req, res) => {
	try {
		const { year, month } = req.params;

		// Validate month and year
		const monthNum = parseInt(month);
		const yearNum = parseInt(year);

		if (monthNum < 1 || monthNum > 12 || isNaN(monthNum) || isNaN(yearNum)) {
			return res.status(400).json({ message: 'Invalid month or year' });
		}

		// Create date range for the selected month
		const startDate = new Date(yearNum, monthNum - 1, 1);
		const endDate = new Date(yearNum, monthNum, 0); // Last day of the month

		// Define the where clause without userId
		const whereClause = {
			date: {
				[Op.between]: [startDate, endDate],
			},
		};

		// Add userId filter if it exists in the request
		if (req.user && req.user.id) {
			whereClause.userId = req.user.id;
		}

		// Get total expense for this date range
		const totalGeneralExpense = await Expense.sum('amount', {
			where: whereClause,
		});

		const totalTourExpense = await Entry.sum('amount', {
			where: whereClause,
		});

		const totalExpense = (totalGeneralExpense || 0) + (totalTourExpense || 0);

		// Get categorical breakdown
		const categoricalExpenses = await Expense.findAll({
			attributes: [[fn('SUM', col('amount')), 'total']],
			include: [
				{
					model: Category,
					attributes: ['id', 'name'],
					required: true,
				},
			],
			where: whereClause,
			group: ['Category.id', 'Category.name'],
			raw: true,
			nest: true,
		});

		let categoryBreakdown = categoricalExpenses.map((item) => ({
			categoryId: item.Category.id,
			categoryName: item.Category.name,
			total: parseFloat(item.total),
		}));

		if (totalTourExpense > 0) {
			categoryBreakdown.push({
				categoryId: 79, // a random id given so that it doesn't match with existing category in the db
				categoryName: 'Tour',
				total: parseFloat(totalTourExpense),
			});
		}
		res.json({
			month: monthNum,
			year: yearNum,
			totalExpense: totalExpense,
			categoricalExpenses: categoryBreakdown,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get monthly expense list
// @route   GET /api/reports/monthly/list/:year/:month
// @access  Private
const getMonthlyExpenseList = async (req, res) => {
	try {
		const { year, month } = req.params;

		// Validate month and year
		const monthNum = parseInt(month);
		const yearNum = parseInt(year);

		if (monthNum < 1 || monthNum > 12 || isNaN(monthNum) || isNaN(yearNum)) {
			return res.status(400).json({ message: 'Invalid month or year' });
		}

		// Create date range for the selected month
		const startDate = new Date(yearNum, monthNum - 1, 1);
		const endDate = new Date(yearNum, monthNum, 0); // Last day of the month

		// Define the where clause without userId
		const whereClause = {
			date: {
				[Op.between]: [startDate, endDate],
			},
		};

		// Add userId filter if it exists in the request
		if (req.user && req.user.id) {
			whereClause.userId = req.user.id;
		}

		// Get expenses for the month
		const expenses = await Expense.findAll({
			where: whereClause,
			include: [
				Category,
				{
					model: User,
					attributes: ['id', 'username'],
				},
			],
			order: [['date', 'DESC']],
		});

		res.json({
			month: monthNum,
			year: yearNum,
			expenses,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get yearly expense summary
// @route   GET /api/reports/yearly/:year
// @access  Private
const getYearlyExpense = async (req, res) => {
	try {
		const { year } = req.params;
		// Validate year
		const yearNum = parseInt(year);

		if (isNaN(yearNum)) {
			return res.status(400).json({ message: 'Invalid year' });
		}

		// Create date range for the selected year
		const startDate = new Date(yearNum, 0, 1);
		const endDate = new Date(yearNum, 11, 31);

		// Define the where clause without userId
		const whereClause = {
			date: {
				[Op.between]: [startDate, endDate],
			},
		};

		// Add userId filter if it exists in the request
		if (req.user && req.user.id) {
			whereClause.userId = req.user.id;
		}

		// Get total expense for the year
		const totalGenealExpense = await Expense.sum('amount', {
			where: whereClause,
		});

		const totalTourExpense = await Entry.sum('amount', {
			whereClause: whereClause,
		});

		const totalExpense = (totalGenealExpense || 0) + (totalTourExpense || 0);
		// Get categorical breakdown
		const categoricalExpenses = await Expense.findAll({
			attributes: [[fn('SUM', col('amount')), 'total']],
			include: [
				{
					model: Category,
					attributes: ['id', 'name'],
					required: true,
				},
			],
			where: whereClause,
			group: ['Category.id', 'Category.name'],
			raw: true,
			nest: true,
		});

		let categoryBreakdown = categoricalExpenses.map((item) => ({
			categoryId: item.Category.id,
			categoryName: item.Category.name,
			total: parseFloat(item.total),
		}));

		if (totalTourExpense > 0) {
			categoryBreakdown.push({
				categoryId: 79, // a random id given so that it doesn't match with existing category in the db
				categoryName: 'Tour',
				total: parseFloat(totalTourExpense),
			});
		}

		res.json({
			year: yearNum,
			totalExpense: totalExpense,
			categoricalExpenses: categoryBreakdown,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get expense data within a date range
// @route   GET /api/reports/range
// @access  Public
const getDateRangeExpense = async (req, res) => {
	try {
		const { fromDate, toDate } = req.query;

		// Validate dates
		const start = new Date(fromDate);
		const end = new Date(toDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return res
				.status(400)
				.json({ message: 'Invalid date format. Use YYYY-MM-DD format' });
		}

		if (start > end) {
			return res
				.status(400)
				.json({ message: 'Start date must be before end date' });
		}

		// Define the where clause
		const whereClause = {
			date: {
				[Op.between]: [start, end],
			},
		};

		// Add userId filter if it exists in the request
		if (req.user && req.user.id) {
			whereClause.userId = req.user.id;
		}
		// Get total expense for the date range
		const totalGenealExpense = await Expense.sum('amount', {
			where: whereClause,
		});

		const totalTourExpense = await Entry.sum('amount', {
			whereClause: whereClause,
		});

		const totalExpense = (totalGenealExpense || 0) + (totalTourExpense || 0);

		// Get categorical breakdown
		const categoricalExpenses = await Expense.findAll({
			attributes: [[fn('SUM', col('amount')), 'total']],
			include: [
				{
					model: Category,
					attributes: ['id', 'name'],
					required: true,
				},
			],
			where: whereClause,
			group: ['Category.id', 'Category.name'],
			raw: true,
			nest: true,
		});

		let categoryBreakdown = categoricalExpenses.map((item) => ({
			categoryId: item.Category.id,
			categoryName: item.Category.name,
			total: parseFloat(item.total),
		}));

		if (totalTourExpense > 0) {
			categoryBreakdown.push({
				categoryId: 79, // a random id given so that it doesn't match with existing category in the db
				categoryName: 'Tour',
				total: parseFloat(totalTourExpense),
			});
		}

		// Get expenses list for the date range
		const expenses = await Expense.findAll({
			where: whereClause,
			include: [
				Category,
				{
					model: User,
					attributes: ['id', 'username'],
				},
			],
			order: [['date', 'DESC']],
		});

		res.json({
			dateRange: {
				startDate: start.toISOString().split('T')[0],
				endDate: end.toISOString().split('T')[0],
			},
			totalExpense: totalExpense,
			categoricalExpenses: categoryBreakdown,
			expenses: expenses,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get expense data within a date range
// @route   GET /api/reports/range
// @access  Private
const getMyDateRangeExpense = async (req, res) => {
	try {
		const { fromDate, toDate } = req.query;

		// Validate dates
		const start = new Date(fromDate);
		const end = new Date(toDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return res
				.status(400)
				.json({ message: 'Invalid date format. Use YYYY-MM-DD format' });
		}

		if (start > end) {
			return res
				.status(400)
				.json({ message: 'Start date must be before end date' });
		}

		// Define the where clause
		const expenseWhereClause = {
			date: {
				[Op.between]: [start, end],
			},
		};

		tourWhereClause = {
			date: {
				[Op.between]: [start, end],
			},
		};
		// Add userId filter if it exists in the request
		if (req.user && req.user.id) {
			expenseWhereClause.UserId = req.user.id;
			tourWhereClause.userId = req.user.id;
		} else {
			return res.status(401).json({ message: 'Not authorized' });
		}

		// Get total expense for the date range
		const totalGenealExpense = await Expense.sum('amount', {
			where: expenseWhereClause,
		});

		const totalTourExpense = await Entry.sum('amount', {
			where: tourWhereClause,
		});

		const totalExpense = (totalGenealExpense || 0) + (totalTourExpense || 0);

		// Get categorical breakdown
		const categoricalExpenses = await Expense.findAll({
			attributes: [[fn('SUM', col('amount')), 'total']],
			include: [
				{
					model: Category,
					attributes: ['id', 'name'],
					required: true,
				},
			],
			where: expenseWhereClause,
			group: ['Category.id', 'Category.name'],
			raw: true,
			nest: true,
		});

		let categoryBreakdown = categoricalExpenses.map((item) => ({
			categoryId: item.Category.id,
			categoryName: item.Category.name,
			total: parseFloat(item.total),
		}));

		if (totalTourExpense > 0) {
			categoryBreakdown.push({
				categoryId: 79, // a random id given so that it doesn't match with existing category in the db
				categoryName: 'Tour',
				total: parseFloat(totalTourExpense),
			});
		}
		// Get expenses list for the date range
		const expenses = await Expense.findAll({
			where: expenseWhereClause,
			include: [
				Category,
				{
					model: User,
					attributes: ['id', 'username'],
				},
			],
			order: [['date', 'DESC']],
		});

		res.json({
			dateRange: {
				startDate: start.toISOString().split('T')[0],
				endDate: end.toISOString().split('T')[0],
			},
			totalExpense: totalExpense || 0,
			categoricalExpenses: categoryBreakdown,
			expenses: expenses,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};
module.exports = {
	getMonthlyExpense,
	getMonthlyExpenseList,
	getYearlyExpense,
	getDateRangeExpense,
	getMyDateRangeExpense,
};
