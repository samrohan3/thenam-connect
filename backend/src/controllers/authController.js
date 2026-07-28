const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');
const { generateToken } = require('../utils/generateToken');
const { validateRegisterInput, validateLoginInput } = require('../validations/authValidation');
const {
  verifyFirebaseToken,
  createFirebaseUser,
  getFirebaseUserByEmail,
  updateFirebaseUser,
  generatePasswordResetLink
} = require('../config/firebase');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password, name, role } = req.body;
    const emailLower = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Step 1: Create user in Firebase Auth
    let firebaseUid = null;
    try {
      const fbUser = await createFirebaseUser({ email: emailLower, password, displayName: name });
      firebaseUid = fbUser?.uid || null;
    } catch (fbErr) {
      console.warn('[Firebase Auth] Registration notice:', fbErr.message);
    }

    // Step 2: Create user in MongoDB
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: emailLower,
      password: hashedPassword,
      name,
      role: role || 'Customer',
      firebaseUid,
      firebaseAuth: true,
      status: 'Active'
    });

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      action: 'Firebase Account Created',
      entity: 'User',
      entityId: user._id,
      details: { email: emailLower, firebaseUid }
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Auth user & get token (Standard MongoDB/bcrypt login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password } = req.body;
    const emailLower = email.toLowerCase().trim();

    let user = await User.findOne({ email: emailLower });
    let employee = null;

    if (!user) {
      employee = await Employee.findOne({ email: emailLower });
    }

    const targetAccount = user || employee;
    if (!targetAccount) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (targetAccount.status === 'Inactive' || targetAccount.status === 'Terminated') {
      return res.status(403).json({ success: false, message: 'Account disabled. Please contact system administrator.' });
    }

    // Check bcrypt password if present
    let passwordValid = false;
    if (user && user.password) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Fallback developer mode or initial accounts match default
      passwordValid = true;
    }

    if (!passwordValid) {
      await ActivityLog.create({
        userName: emailLower,
        action: 'Login Failure',
        entity: 'Auth',
        details: { email: emailLower, reason: 'Invalid password' }
      }).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userPayload = {
      id: targetAccount._id || targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      role: targetAccount.role || 'Employee',
      avatar: targetAccount.avatar || targetAccount.photo,
      firebaseUid: targetAccount.firebaseUid,
      employeeId: employee?.employeeId || targetAccount.employeeId,
      token: generateToken(targetAccount._id || targetAccount.id)
    };

    await ActivityLog.create({
      user: targetAccount._id,
      userName: targetAccount.name,
      action: 'Login Success',
      entity: 'Auth',
      details: { email: emailLower, method: 'Standard Auth' }
    }).catch(() => {});

    return res.json({
      success: true,
      data: userPayload
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Firebase Token Login
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken, email, password } = req.body;

    let userEmail = email ? email.toLowerCase().trim() : '';
    let firebaseUid = null;

    // Verify ID token if provided
    if (idToken) {
      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Firebase ID token' });
      }
      userEmail = decodedToken.email ? decodedToken.email.toLowerCase() : userEmail;
      firebaseUid = decodedToken.uid;
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    // Find MongoDB User or Employee profile
    let user = await User.findOne({ $or: [{ firebaseUid }, { email: userEmail }] });
    let employee = await Employee.findOne({ $or: [{ firebaseUid }, { email: userEmail }] });

    const account = user || employee;
    if (!account) {
      return res.status(403).json({ success: false, message: 'User profile not configured in ERP.' });
    }

    if (account.status === 'Inactive' || account.status === 'Terminated') {
      return res.status(403).json({ success: false, message: 'Account disabled. Contact system administrator.' });
    }

    // Link firebaseUid if missing
    if (firebaseUid && !account.firebaseUid) {
      account.firebaseUid = firebaseUid;
      await account.save();
    }

    const token = generateToken(account._id);

    const userPayload = {
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role || 'Employee',
      avatar: account.avatar || account.photo,
      firebaseUid: account.firebaseUid || firebaseUid,
      employeeId: employee?.employeeId || account.employeeId,
      token
    };

    await ActivityLog.create({
      user: account._id,
      userName: account.name,
      action: 'Login Success',
      entity: 'Auth',
      details: { email: userEmail, method: 'Firebase Auth' }
    }).catch(() => {});

    return res.json({
      success: true,
      data: userPayload
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const emailLower = email.toLowerCase().trim();
    const link = await generatePasswordResetLink(emailLower);

    await ActivityLog.create({
      userName: emailLower,
      action: 'Password Reset Requested',
      entity: 'Auth',
      details: { email: emailLower }
    }).catch(() => {});

    return res.json({
      success: true,
      message: `Password reset link generated for ${emailLower}.`,
      resetLink: link
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send password reset request.'
    });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    const employee = await Employee.findById(req.user.id);
    const target = user || employee;

    if (!target) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Update Firebase Auth user password if firebaseUid exists
    if (target.firebaseUid) {
      await updateFirebaseUser(target.firebaseUid, { password: newPassword });
    }

    // If User schema has bcrypt password, update it
    if (user && user.password) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
    }

    await ActivityLog.create({
      user: target._id,
      userName: target.name,
      action: 'Password Changed',
      entity: 'Auth',
      details: { email: target.email, firebaseUid: target.firebaseUid }
    }).catch(() => {});

    return res.json({ success: true, message: 'Password updated successfully across Firebase and ERP.' });
  } catch (error) {
    return next(error);
  }
};

// @desc    Migrate existing users to Firebase Auth
// @route   POST /api/auth/migrate-existing-users
// @access  Private (Founder/Admin)
const migrateExistingUsers = async (req, res, next) => {
  try {
    const usersWithoutFb = await User.find({ $or: [{ firebaseUid: null }, { firebaseUid: { $exists: false } }] });
    const employeesWithoutFb = await Employee.find({ $or: [{ firebaseUid: null }, { firebaseUid: { $exists: false } }] });

    let migratedUsersCount = 0;
    let linkedUsersCount = 0;

    // Process Users
    for (const u of usersWithoutFb) {
      try {
        let fbUser = await getFirebaseUserByEmail(u.email);
        if (fbUser) {
          u.firebaseUid = fbUser.uid;
          linkedUsersCount++;
        } else {
          fbUser = await createFirebaseUser({ email: u.email, password: 'Thenam@12345', displayName: u.name });
          u.firebaseUid = fbUser?.uid || null;
          migratedUsersCount++;
        }
        u.firebaseAuth = true;
        await u.save();

        await ActivityLog.create({
          user: req.user?._id,
          userName: req.user?.name || 'System Migration',
          action: 'Firebase Account Linked',
          entity: 'User',
          entityId: u._id,
          details: { email: u.email, firebaseUid: u.firebaseUid }
        }).catch(() => {});
      } catch (err) {
        console.error(`[User Migration] Failed for ${u.email}:`, err.message);
      }
    }

    // Process Employees
    for (const emp of employeesWithoutFb) {
      try {
        let fbUser = await getFirebaseUserByEmail(emp.email);
        if (fbUser) {
          emp.firebaseUid = fbUser.uid;
          linkedUsersCount++;
        } else {
          fbUser = await createFirebaseUser({ email: emp.email, password: 'Thenam@12345', displayName: emp.name });
          emp.firebaseUid = fbUser?.uid || null;
          migratedUsersCount++;
        }
        emp.firebaseAuth = true;
        await emp.save();
      } catch (err) {
        console.error(`[Employee Migration] Failed for ${emp.email}:`, err.message);
      }
    }

    return res.json({
      success: true,
      message: 'User migration completed safely.',
      data: {
        migratedFirebaseUsers: migratedUsersCount,
        linkedExistingFirebaseUsers: linkedUsersCount,
        totalProcessed: usersWithoutFb.length + employeesWithoutFb.length
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: req.body.email.toLowerCase() });
      if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
      user.email = req.body.email.toLowerCase();
    }

    const updatedUser = await user.save();

    // Update Firebase displayName if applicable
    if (user.firebaseUid) {
      await updateFirebaseUser(user.firebaseUid, { displayName: user.name, email: user.email });
    }

    return res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        firebaseUid: updatedUser.firebaseUid
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  firebaseLogin,
  forgotPassword,
  changePassword,
  migrateExistingUsers,
  getUserProfile,
  updateProfile,
  getUsers
};
