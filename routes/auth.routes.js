const express = require('express');
const {
	signup,
	login,
	refreshToken,
	validateToken,
	logout,
} = require('../controllers/auth.controller');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/refresh').post(refreshToken);
router.route('/validate').post(validateToken);
router.route('/logout').post(logout);

module.exports = router;
