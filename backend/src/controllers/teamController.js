const Team = require('../models/Team');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = asyncHandler(async (req, res) => {
  const { venture, status, search, teamLead } = req.query;

  const query = {};
  if (venture) query.venture = venture;
  if (status) query.status = status;
  if (teamLead) query.teamLead = teamLead;
  if (search) {
    query.teamName = { $regex: search, $options: 'i' };
  }

  const teams = await Team.find(query)
    .populate('venture', 'name key code category')
    .populate('teamLead', 'name email avatar designation')
    .populate('members', 'name email avatar designation employeeId department status')
    .sort({ createdAt: -1 });

  // Get active project count for each team/venture
  const teamsWithStats = await Promise.all(
    teams.map(async (t) => {
      const activeProjects = await Project.countDocuments({
        venture: t.venture?._id || t.venture,
        status: { $in: ['In Progress', 'Active', 'Testing'] }
      });
      return {
        ...t.toObject(),
        activeProjectsCount: activeProjects,
        memberCount: t.members?.length || 0
      };
    })
  );

  return success(res, teamsWithStats, 'Teams retrieved successfully');
});

// @desc    Get teams for a specific venture
// @route   GET /api/ventures/:id/teams
// @access  Private
const getVentureTeams = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teams = await Team.find({ venture: id, status: 'Active' })
    .populate('teamLead', 'name email avatar designation')
    .sort({ teamName: 1 });

  return success(res, teams, 'Venture teams retrieved successfully');
});

// @desc    Get members of a specific team
// @route   GET /api/teams/:id/members
// @access  Private
const getTeamMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const team = await Team.findById(id).populate({
    path: 'members',
    populate: [
      { path: 'venture', select: 'name' },
      { path: 'reportingManager', select: 'name email' }
    ]
  });

  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  return success(res, team.members || [], 'Team members retrieved successfully');
});

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Founder, Admin, Manager)
const createTeam = asyncHandler(async (req, res) => {
  const { teamName, venture, ventureId, teamLead, teamLeadId, description, status, members } = req.body;

  const targetVenture = ventureId || venture;
  if (!teamName || !targetVenture) {
    return res.status(400).json({ success: false, message: 'Team name and Venture are required' });
  }

  const newTeam = await Team.create({
    teamName,
    venture: targetVenture,
    teamLead: teamLeadId || teamLead || null,
    description: description || '',
    status: status || 'Active',
    members: Array.isArray(members) ? members : [],
    createdBy: req.user?._id
  });

  // If members were passed, update employee records to reference this team
  if (Array.isArray(members) && members.length > 0) {
    await Employee.updateMany(
      { _id: { $in: members } },
      { team: newTeam._id, venture: targetVenture }
    );
  }

  const populated = await Team.findById(newTeam._id)
    .populate('venture', 'name key')
    .populate('teamLead', 'name email avatar')
    .populate('members', 'name email avatar designation');

  return res.status(201).json({
    success: true,
    data: populated,
    message: 'Team created successfully'
  });
});

// @desc    Update a team
// @route   PUT /api/teams/:id
// @access  Private (Founder, Admin, Manager)
const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teamName, venture, ventureId, teamLead, teamLeadId, description, status, members } = req.body;

  const team = await Team.findById(id);
  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  const oldMembers = team.members ? team.members.map(m => String(m)) : [];
  const newMembers = Array.isArray(members) ? members.map(m => String(m)) : oldMembers;

  team.teamName = teamName !== undefined ? teamName : team.teamName;
  team.venture = (ventureId || venture) !== undefined ? (ventureId || venture) : team.venture;
  team.teamLead = (teamLeadId !== undefined ? teamLeadId : teamLead) !== undefined ? (teamLeadId || teamLead) : team.teamLead;
  team.description = description !== undefined ? description : team.description;
  team.status = status !== undefined ? status : team.status;
  team.members = newMembers;

  await team.save();

  // Sync employees: removed members -> unassigned; added members -> assigned to this team
  const removedMembers = oldMembers.filter(m => !newMembers.includes(m));
  const addedMembers = newMembers.filter(m => !oldMembers.includes(m));

  if (removedMembers.length > 0) {
    await Employee.updateMany({ _id: { $in: removedMembers } }, { team: null });
  }
  if (addedMembers.length > 0) {
    await Employee.updateMany({ _id: { $in: addedMembers } }, { team: team._id, venture: team.venture });
  }

  const populated = await Team.findById(team._id)
    .populate('venture', 'name key')
    .populate('teamLead', 'name email avatar')
    .populate('members', 'name email avatar designation');

  return success(res, populated, 'Team updated successfully');
});

// @desc    Delete a team (Unassigns members to 'Unassigned')
// @route   DELETE /api/teams/:id
// @access  Private (Founder, Admin, Manager)
const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const team = await Team.findById(id);
  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  // Unassign members from team (Set teamId to null)
  await Employee.updateMany({ team: id }, { team: null });

  await team.deleteOne();

  return success(res, { id }, 'Team deleted successfully. Members moved to Unassigned.');
});

module.exports = {
  getTeams,
  getVentureTeams,
  getTeamMembers,
  createTeam,
  updateTeam,
  deleteTeam
};
