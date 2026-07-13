const express = require('express');
const router = express.Router();
const ventureController = require('../controllers/ventureController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(ventureController.getVentures)
    .post(ventureController.createVenture);

router.route('/:id')
    .get(ventureController.getVenture)
    .put(ventureController.updateVenture)
    .delete(ventureController.deleteVenture);

router.post('/:id/archive', ventureController.archiveVenture);
router.post('/:id/restore', ventureController.restoreVenture);

module.exports = router;
