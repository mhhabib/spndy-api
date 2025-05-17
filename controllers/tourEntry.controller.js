const { Entry, Tour } = require('../models');

async function updateTourTotalCost(tourId) {
	const entries = await Entry.findAll({ where: { tourId } });
	const total = entries.reduce(
		(sum, entry) => sum + parseFloat(entry.amount),
		0
	);

	await Tour.update({ totalCost: total }, { where: { id: tourId } });
}

// @desc    Create a new tour
// @route   POST /api/entries
// @access  private
const createEntry = async (req, res) => {
	try {
		const userId = req.user.id;
		const { description, date, location, amount, tourId, type } = req.body;

		if (!userId) {
			return res
				.status(400)
				.json({ error: 'User must be authorized to create the entry' });
		}

		const typeName = type?.toLowerCase();
		const entry = await Entry.create({
			description,
			date,
			location,
			amount,
			type: typeName,
			tourId,
			userId,
		});
		updateTourTotalCost(tourId);
		res.status(201).json(entry);
	} catch (error) {
		console.error('Create Entry Error:', error);
		res.status(500).json({ error: 'Failed to create entry' });
	}
};

// @desc    update existing tour
// @route   PUT /api/entries/:entryId
// @access  private
const updateEntry = async (req, res) => {
	try {
		const { entryId } = req.params;
		const userId = req.user.id;
		const { description, date, location, amount, tourId, type } = req.body;

		const entry = await Entry.findByPk(entryId);

		if (!entry) {
			return res
				.status(404)
				.json({ error: `${description} associated tour is not found` });
		}

		if (entry.userId !== userId) {
			return res
				.status(403)
				.json({ error: 'User must be authorized to update the entry' });
		}
		const typeName = type.toLowerCase();
		await entry.update({
			description,
			date,
			location,
			amount,
			type: typeName,
		});
		updateTourTotalCost(tourId);
		res.status(200).json(entry);
	} catch (error) {
		console.error('Update Entry Error:', error);
		res.status(500).json({ error: 'Failed to update entry' });
	}
};

// @desc    Delete existing tour
// @route   DELETE /api/entries/:tourId/:entryId
// @access  private
const deleteEntry = async (req, res) => {
	try {
		const { tourId, entryId } = req.params;
		const userId = req.user.id;
		const entry = await Entry.findByPk(entryId);

		if (!entry) {
			return res.status(404).json({ error: 'The entry was not found' });
		}

		if (entry.userId !== userId) {
			return res
				.status(403)
				.json({ error: 'User must be authorized to update the entry' });
		}

		await entry.destroy();
		updateTourTotalCost(tourId);
		res
			.status(200)
			.json({
				message: `The entry "${entry.description}" deleted successfully`,
			});
	} catch (error) {
		console.error('Delete Entry Error:', error);
		res.status(500).json({ error: 'Failed to delete entry' });
	}
};

module.exports = { createEntry, updateEntry, deleteEntry };
