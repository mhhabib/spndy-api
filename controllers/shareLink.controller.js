const { Op } = require('sequelize');
const Tour = require('../models/tour.model');
const ShareLink = require('../models/shareLink.modal');
const { Entry } = require('../models');
const { generateHexLink } = require('../utils/generateLinkHash');

// @desc    Create a new tour
// @route   POST /api/tours/share
// @access  Public
const shareLink = async (req, res) => {
	try {
		const { isPublic, tourId } = req.body;

		// Check if tour exists
		const tour = await Tour.findByPk(tourId);
		if (!tour) {
			return res.status(404).json({ error: 'Tour not found' });
		}

		// Find existing share link
		let link = await ShareLink.findOne({ where: { tourId } });

		if (link) {
			link.isPublic = isPublic;
			link.shareLink = isPublic ? generateHexLink(6) : null;
			await link.save();
		} else {
			link = await ShareLink.create({
				isPublic,
				tourId,
				shareLink: isPublic ? generateHexLink(6) : null,
			});
		}

		res.status(200).json(link);
	} catch (error) {
		console.error('Error creating/updating ShareLink:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

// @desc    Get tour data by share link hex code
// @route   GET /api/tours/share/:hexCode
// @access  Public

const getTourByShareLink = async (req, res) => {
	try {
		const { hexCode } = req.params;
		// Find the share link by hex code
		const shareLink = await ShareLink.findOne({
			where: {
				shareLink: hexCode,
				isPublic: true, // Only allow access to public share links
			},
			include: [
				{
					model: Tour,
					as: 'tour',
					include: [
						{
							model: Entry,
							as: 'entries',
						},
					],
				},
			],
		});

		// Check if share link exists and is public
		if (!shareLink) {
			return res.status(404).json({
				error: 'Share link not found or tour is not public',
			});
		}

		// Check if associated tour exists
		if (!shareLink.tour) {
			return res.status(404).json({
				error: 'Tour associated with this share link not found',
			});
		}

		// Return the tour data
		res.status(200).json({
			success: true,
			data: shareLink.tour,
		});
	} catch (error) {
		console.error('Error fetching tour by share link:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

module.exports = { shareLink, getTourByShareLink };
