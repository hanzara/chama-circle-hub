
const User = require('../models/User');
const Chama = require('../models/Chama');
const ChamaMember = require('../models/ChamaMember');
const LoanApplication = require('../models/LoanApplication');
const Investment = require('../models/Investment');
const MpesaTransaction = require('../models/MpesaTransaction');
const Notification = require('../models/Notification');

// User management
const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { search, role, status } = req.query;

    let filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's chamas
    const chamas = await ChamaMember.find({ userId: id, isActive: true })
      .populate('chamaId', 'name currentMembers totalSavings');

    // Get user's loans
    const loans = await LoanApplication.find({ borrowerId: id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's investments
    const investments = await Investment.find({ investorId: id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user,
      chamas,
      loans,
      investments
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification
    await Notification.create({
      userId: id,
      title: 'Account Activated',
      message: 'Your account has been activated by an administrator.',
      type: 'success',
      category: 'security'
    });

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification
    await Notification.create({
      userId: id,
      title: 'Account Deactivated',
      message: 'Your account has been deactivated. Contact support for assistance.',
      type: 'warning',
      category: 'security'
    });

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification
    await Notification.create({
      userId: id,
      title: 'Role Updated',
      message: `Your role has been updated to ${role}.`,
      type: 'info',
      category: 'security'
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Chama management
const getAllChamas = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { search, status } = req.query;

    let filter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    if (status) filter.status = status;

    const chamas = await Chama.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chama.countDocuments(filter);

    res.json({
      chamas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting chamas:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Dashboard data
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalChamas = await Chama.countDocuments();
    const activeChamas = await Chama.countDocuments({ status: 'active' });
    
    const pendingLoans = await LoanApplication.countDocuments({ status: 'pending' });
    const totalLoans = await LoanApplication.countDocuments();
    
    const totalTransactions = await MpesaTransaction.countDocuments();
    const successfulTransactions = await MpesaTransaction.countDocuments({ status: 'success' });

    // Recent activities
    const recentUsers = await User.find()
      .select('fullName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentChamas = await Chama.find()
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly growth
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyNewUsers = await User.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    const monthlyNewChamas = await Chama.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalChamas,
        activeChamas,
        pendingLoans,
        totalLoans,
        totalTransactions,
        successfulTransactions,
        monthlyNewUsers,
        monthlyNewChamas
      },
      recentUsers,
      recentChamas
    });
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  activateUser,
  deactivateUser,
  updateUserRole,
  getAllChamas,
  getAdminDashboard,
  // Add other admin methods here...
};
