const express = require('express');
const router = express.Router();
const ventureController = require('../controllers/ventureController');
const teamController = require('../controllers/teamController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(canAccess('ventures', 'read'), ventureController.getVentures)
    .post(canAccess('ventures', 'create'), ventureController.createVenture);

router.get('/:id/teams', canAccess('team', 'read'), teamController.getVentureTeams);

router.route('/:id')
    .get(canAccess('ventures', 'read'), ventureController.getVenture)
    .put(canAccess('ventures', 'update'), ventureController.updateVenture)
    .delete(canAccess('ventures', 'delete'), ventureController.deleteVenture);

router.post('/:id/archive', canAccess('ventures', 'update'), ventureController.archiveVenture);
router.post('/:id/restore', canAccess('ventures', 'update'), ventureController.restoreVenture);

module.exports = router;
