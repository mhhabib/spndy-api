const { Op } = require('sequelize');
const Ledger = require('../models/ledger.model');
const User = require('../models/user.model');

// @desc    Create a new Ledger
// @route   POST /api/ledgers
// @access  Public (later you can secure it with auth)
const createLedger = async (req, res) => {
	try {
		const { from, to, type, description, amount, date } = req.body;
		// validate type
		if (!['LEND', 'BORROW'].includes(type)) {
			console.log('Type not found');
			return res
				.status(400)
				.json({ message: 'Type must be either LEND or BORROW' });
		}

		const ledger = await Ledger.create({
			from,
			to,
			type,
			description,
			amount,
			date,
			UserId: req.user.id,
		});
		res.status(201).json(ledger);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get all Ledger
// @route   GET /api/ledgers
// @access  Public
const getLedgers = async (req, res) => {
	try {
		const ledgers = await Ledger.findAll({
			include: [{ model: User, attributes: ['id', 'username'] }],
		});
		res.json(ledgers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Get a Ledger by ID
// @route   GET /api/ledgers/:id
// @access  Public
const getLedgerById = async (req, res) => {
	try {
		const ledger = await Ledger.findByPk(req.params.id, {
			include: [{ model: User, attributes: ['id', 'name', 'email'] }],
		});

		if (hisab) {
			res.json(hisab);
		} else {
			res.status(404).json({ message: 'Ledger not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Update a Ledger
// @route   PUT /api/ledgers/:id
// @access  Public
const updateLedger = async (req, res) => {
	try {
		const { from, to, type, description, amount, date } = req.body;
		const ledger = await Ledger.findByPk(req.params.id);

		if (ledger) {
			if (type && !['LEND', 'BORROW'].includes(type)) {
				return res
					.status(400)
					.json({ message: 'Type must be either LEND or BORROW' });
			}

			ledger.from = from ?? ledger.from;
			ledger.to = to ?? ledger.to;
			ledger.type = type ?? ledger.type;
			ledger.description = description ?? ledger.description;
			ledger.amount = amount ?? ledger.amount;
			ledger.date = date ?? ledger.date;

			await ledger.save();
			res.json(ledger);
		} else {
			res.status(404).json({ message: 'Ledger not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// @desc    Delete a Ledger
// @route   DELETE /api/ledgers/:id
// @access  Public
const deleteLedger = async (req, res) => {
	try {
		const ledger = await Ledger.findByPk(req.params.id);

		if (!ledger) {
			return res.status(404).json({ message: 'Ledger not found' });
		}

		await ledger.destroy();
		res.json({ message: 'Ledger deleted' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	createLedger,
	getLedgers,
	getLedgerById,
	updateLedger,
	deleteLedger,
};
