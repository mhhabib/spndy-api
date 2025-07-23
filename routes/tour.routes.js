const express = require('express');
const {
	createTour,
	getTours,
	getTourById,
	updateTour,
	deleteTour,
} = require('../controllers/tour.controller');
const {
	shareLink,
	getTourByShareLink,
} = require('../controllers/shareLink.controller');

const router = express.Router();

router.route('/').post(createTour).get(getTours);
router.route('/:id').get(getTourById).put(updateTour).delete(deleteTour);
router.route('/share').post(shareLink);
router.route('/share/:hexCode').get(getTourByShareLink);
module.exports = router;
