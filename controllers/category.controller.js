const { Op } = require('sequelize');
const Category = require('../models/category.model');
const Expense = require('../models/expense.model');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public
const createCategory = async (req, res) => {
	try {
		const { name } = req.body;

		// Check if category already exists
		const categoryExists = await Category.findOne({ where: { name } });

		if (categoryExists) {
			return res.status(400).json({ message: 'Category already exists' });
		}

		const category = await Category.create({ name });
		res.status(201).json(category);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
	try {
		const categories = await Category.findAll();
		res.json(categories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get a category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
	try {
		const category = await Category.findByPk(req.params.id);

		if (category) {
			res.json(category);
		} else {
			res.status(404).json({ message: 'Category not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = async (req, res) => {
	try {
		const { name } = req.body;
		const category = await Category.findByPk(req.params.id);

		if (category) {
			// Check if the new name already exists for another category
			const existingCategory = await Category.findOne({
				where: {
					name,
					id: { [Op.ne]: req.params.id },
				},
			});

			if (existingCategory) {
				return res
					.status(400)
					.json({ message: 'Category name already exists' });
			}

			category.name = name;
			await category.save();
			res.json(category);
		} else {
			res.status(404).json({ message: 'Category not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = async (req, res) => {
	try {
		const category = await Category.findByPk(req.params.id);

		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		// Check if any expense uses this category
		const expenseCount = await Expense.count({
			where: { CategoryId: req.params.id },
		});

		if (expenseCount > 0) {
			return res.status(400).json({
				message:
					'This category is linked to existing expense and cannot be deleted. Please remove or reassign the expenses before deleting the category.',
			});
		}

		await category.destroy();
		res.json({ message: 'Category deleted' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	createCategory,
	getCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
};
