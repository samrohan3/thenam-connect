const express = require('express');
const router = express.Router();
const workspaceLinkController = require('../controllers/workspaceLinkController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(canAccess('workspace_links', 'read'), workspaceLinkController.getLinks)
  .post(canAccess('workspace_links', 'create'), workspaceLinkController.createLink);

router.get('/recent', canAccess('workspace_links', 'read'), workspaceLinkController.getRecentLinks);

router.post('/:id/open', canAccess('workspace_links', 'read'), workspaceLinkController.trackLinkOpen);
router.post('/:id/archive', canAccess('workspace_links', 'update'), workspaceLinkController.archiveLink);
router.post('/:id/restore', canAccess('workspace_links', 'update'), workspaceLinkController.restoreLink);

router.route('/:id')
  .get(canAccess('workspace_links', 'read'), workspaceLinkController.getLink)
  .put(canAccess('workspace_links', 'update'), workspaceLinkController.updateLink)
  .delete(canAccess('workspace_links', 'delete'), workspaceLinkController.deleteLink);

module.exports = router;
