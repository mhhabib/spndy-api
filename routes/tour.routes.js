const express = require('express');
const {
	createTour,
	getTours,
	getTourById,
	updateTour,
	deleteTour,
	addSharedLink,
	shareTour,
} = require('../controllers/tour.controller');

const router = express.Router();

router.route('/').post(createTour).get(getTours);
router.route('/:id').get(getTourById).put(updateTour).delete(deleteTour);
router.route('/:id/share').post(shareTour);
router.route('/add-shared-link').get(addSharedLink);

module.exports = router;
