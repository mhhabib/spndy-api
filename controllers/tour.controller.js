const { Op } = require('sequelize');
const Tour = require('../models/tour.model');
const { Entry } = require('../models');
const runMigration = require('../utils/addSharedLinkColumn');
const crypto = require('crypto');

// @desc    Create a new tour
// @route   POST /api/tours
// @access  Public
const createTour = async (req, res) => {
	try {
		const { name, location, startDate, endDate, totalCost, isPublic } =
			req.body;

		const tourExists = await Tour.findOne({ where: { name } });

		if (tourExists) {
			return res.status(400).json({ message: 'The tour is already exists' });
		}

		const tour = await Tour.create({
			name,
			location,
			startDate,
			endDate,
			totalCost,
			isPublic,
		});
		res.status(201).json(tour);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get all tours
// @route   GET /api/tours
// @access  Public
const getTours = async (req, res) => {
	try {
		const tours = await Tour.findAll({
			include: [
				{
					model: Entry,
					as: 'entries',
				},
			],
			order: [['endDate', 'DESC']],
		});
		res.json(tours);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Update a tour by ID
// @route   PUT /api/tours/:id
// @access  Public (or secure it if needed)
const updateTour = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, location, startDate, endDate, totalCost, isPublic } =
			req.body;

		// Find tour by ID
		const tour = await Tour.findByPk(id);

		if (!tour) {
			return res.status(404).json({ message: 'The tour was not found' });
		}

		// Update fields
		tour.name = name ?? tour.name;
		tour.location = location ?? tour.location;
		tour.startDate = startDate ?? tour.startDate;
		tour.endDate = endDate ?? tour.endDate;
		tour.totalCost = totalCost;
		tour.isPublic = isPublic ?? tour.isPublic;
		await tour.save();

		res.status(200).json(tour);
	} catch (error) {
		console.error('Error updating tour:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get a update by ID
// @route   GET /api/tours/:id
// @access  Public
const getTourById = async (req, res) => {
	try {
		const tour = await Tour.findByPk(req.params.id);
		if (tour) {
			res.json(tour);
		} else {
			res.status(404).json({ message: 'The tour was not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Delete a tour
// @route   DELETE /api/tours/:id
// @access  Public
const deleteTour = async (req, res) => {
	try {
		const tour = await Tour.findByPk(req.params.id);

		if (!tour) {
			return res.status(404).json({ message: 'The tour was not found' });
		}

		// Check if any expense uses this category
		const expenseCount = await Entry.count({
			where: { tourId: req.params.id },
		});

		if (expenseCount > 0) {
			return res.status(400).json({
				message:
					'This tour has one or more linked entries and cannot be deleted. Please remove or reassign all associated entries before attempting to delete this tour.',
			});
		}

		await tour.destroy();
		res.json({ message: `The tour ${tour.name} is deleted` });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// DB migrations for shareLink

const addSharedLink = async (req, res) => {
	try {
		await runMigration();
		res.send('Migration complete!');
	} catch (error) {
		console.error(error);
		res.status(500).send('Migration failed!');
	}
};

// @desc    Update tour sharing status and link
// @route   POST /api/tours/:id/share
// @access  Public (secure if needed)
const shareTour = async (req, res) => {
	try {
		const { id } = req.params;
		const { isPublic } = req.body;

		if (typeof isPublic !== 'boolean') {
			return res
				.status(400)
				.json({ message: '`isPublic` must be true or false.' });
		}

		const tour = await Tour.findByPk(id);

		if (!tour) {
			return res.status(404).json({ message: 'Tour not found.' });
		}

		tour.isPublic = isPublic;

		if (isPublic) {
			// Generate a unique 6-digit hex string
			tour.sharedLink = crypto.randomBytes(3).toString('hex');
		} else {
			tour.sharedLink = null;
		}

		await tour.save();

		res.status(200).json({
			message: `Tour ${isPublic ? 'shared' : 'unshared'} successfully.`,
			tour,
		});
	} catch (error) {
		console.error('Error sharing tour:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	createTour,
	getTours,
	getTourById,
	updateTour,
	deleteTour,
	addSharedLink,
	shareTour,
};
