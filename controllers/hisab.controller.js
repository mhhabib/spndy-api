const { Op } = require('sequelize');
const Hisab = require('../models/hisab.model');
const User = require('../models/user.model');

// @desc    Create a new Hisab
// @route   POST /api/hisabs
// @access  Public (later you can secure it with auth)
const createHisab = async (req, res) => {
	try {
		const { from, to, type, description, amount, date, userId } = req.body;

		// validate type
		if (!['LEND', 'BORROW'].includes(type)) {
			return res
				.status(400)
				.json({ message: 'Type must be either LEND or BORROW' });
		}

		// check if user exists
		const user = await User.findByPk(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const hisab = await Hisab.create({
			from,
			to,
			type,
			description,
			amount,
			date,
			UserId: userId, // FK
		});

		res.status(201).json(hisab);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get all Hisabs
// @route   GET /api/hisabs
// @access  Public
const getHisabs = async (req, res) => {
	try {
		const hisabs = await Hisab.findAll({
			include: [{ model: User, attributes: ['id', 'name', 'email'] }], // adjust attrs as needed
		});
		res.json(hisabs);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get a Hisab by ID
// @route   GET /api/hisabs/:id
// @access  Public
const getHisabById = async (req, res) => {
	try {
		const hisab = await Hisab.findByPk(req.params.id, {
			include: [{ model: User, attributes: ['id', 'name', 'email'] }],
		});

		if (hisab) {
			res.json(hisab);
		} else {
			res.status(404).json({ message: 'Hisab not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Update a Hisab
// @route   PUT /api/hisabs/:id
// @access  Public
const updateHisab = async (req, res) => {
	try {
		const { from, to, type, description, amount, date, userId } = req.body;
		const hisab = await Hisab.findByPk(req.params.id);

		if (hisab) {
			if (type && !['LEND', 'BORROW'].includes(type)) {
				return res
					.status(400)
					.json({ message: 'Type must be either LEND or BORROW' });
			}

			if (userId) {
				const user = await User.findByPk(userId);
				if (!user) {
					return res.status(404).json({ message: 'User not found' });
				}
				hisab.UserId = userId;
			}

			hisab.from = from ?? hisab.from;
			hisab.to = to ?? hisab.to;
			hisab.type = type ?? hisab.type;
			hisab.description = description ?? hisab.description;
			hisab.amount = amount ?? hisab.amount;
			hisab.date = date ?? hisab.date;

			await hisab.save();
			res.json(hisab);
		} else {
			res.status(404).json({ message: 'Hisab not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Delete a Hisab
// @route   DELETE /api/hisabs/:id
// @access  Public
const deleteHisab = async (req, res) => {
	try {
		const hisab = await Hisab.findByPk(req.params.id);

		if (!hisab) {
			return res.status(404).json({ message: 'Hisab not found' });
		}

		await hisab.destroy();
		res.json({ message: 'Hisab deleted' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	createHisab,
	getHisabs,
	getHisabById,
	updateHisab,
	deleteHisab,
};
