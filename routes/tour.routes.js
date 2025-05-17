const express = require('express');
const {
	createTour,
	getTours,
	getTourById,
	updateTour,
	deleteTour,
} = require('../controllers/tour.controller');

const router = express.Router();

router.route('/').post(createTour).get(getTours);
router.route('/:id').get(getTourById).put(updateTour).delete(deleteTour);

module.exports = router;
