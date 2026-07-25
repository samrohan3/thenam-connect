const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(canAccess('team', 'read'), teamController.getTeams)
  .post(canAccess('team', 'create'), teamController.createTeam);

router.get('/:id/members', canAccess('team', 'read'), teamController.getTeamMembers);

router.route('/:id')
  .put(canAccess('team', 'update'), teamController.updateTeam)
  .delete(canAccess('team', 'delete'), teamController.deleteTeam);

module.exports = router;
