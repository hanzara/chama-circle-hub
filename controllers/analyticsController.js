
const User = require('../models/User');
const Chama = require('../models/Chama');
const ChamaMember = require('../models/ChamaMember');
const ChamaContribution = require('../models/ChamaContribution');
const ChamaLoan = require('../models/ChamaLoan');
const Investment = require('../models/Investment');
const MpesaTransaction = require('../models/MpesaTransaction');

// User analytics
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's chamas
    const userMemberships = await ChamaMember.find({ userId, isActive: true })
      .populate('chamaId');

    // Get total savings
    const totalSavings = await ChamaContribution.aggregate([
      { $match: { memberId: { $in: userMemberships.map(m => m._id) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get total investments
    const totalInvestments = await Investment.aggregate([
      { $match: { investorId: userId } },
      { $group: { _id: null, total: { $sum: '$amountInvested' } } }
    ]);

    // Get active loans
    const activeLoans = await ChamaLoan.countDocuments({
      borrowerId: { $in: userMemberships.map(m => m._id) },
      status: 'active'
    });

    // Get recent transactions
    const recentTransactions = await MpesaTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalSavings: totalSavings[0]?.total || 0,
      totalInvestments: totalInvestments[0]?.total || 0,
      activeLoans,
      chamasCount: userMemberships.length,
      recentTransactions
    });
  } catch (error) {
    console.error('Error getting user dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserSavingsAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '6months' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '1month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case '3months':
        dateFilter.setMonth(dateFilter.getMonth() - 3);
        break;
      case '6months':
        dateFilter.setMonth(dateFilter.getMonth() - 6);
        break;
      case '1year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
    }

    const userMemberships = await ChamaMember.find({ userId, isActive: true });

    const savingsData = await ChamaContribution.aggregate([
      {
        $match: {
          memberId: { $in: userMemberships.map(m => m._id) },
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ savingsData });
  } catch (error) {
    console.error('Error getting savings analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserInvestmentAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const investments = await Investment.find({ investorId: userId });
    
    const analytics = {
      totalInvested: investments.reduce((sum, inv) => sum + inv.amountInvested, 0),
      totalReturns: investments.reduce((sum, inv) => sum + inv.actualReturn, 0),
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      averageROI: 0,
      investmentsByType: {}
    };

    // Calculate average ROI
    const completedInvestments = investments.filter(inv => inv.status === 'completed');
    if (completedInvestments.length > 0) {
      analytics.averageROI = completedInvestments.reduce((sum, inv) => 
        sum + ((inv.actualReturn - inv.amountInvested) / inv.amountInvested * 100), 0
      ) / completedInvestments.length;
    }

    // Group by investment type
    investments.forEach(inv => {
      if (!analytics.investmentsByType[inv.investmentType]) {
        analytics.investmentsByType[inv.investmentType] = {
          count: 0,
          totalAmount: 0
        };
      }
      analytics.investmentsByType[inv.investmentType].count++;
      analytics.investmentsByType[inv.investmentType].totalAmount += inv.amountInvested;
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error getting investment analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Chama analytics
const getChamaOverview = async (req, res) => {
  try {
    const { chamaId } = req.params;

    const chama = await Chama.findById(chamaId);
    if (!chama) {
      return res.status(404).json({ error: 'Chama not found' });
    }

    // Check if user is member
    const membership = await ChamaMember.findOne({
      userId: req.user._id,
      chamaId,
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get member count
    const memberCount = await ChamaMember.countDocuments({ chamaId, isActive: true });

    // Get total contributions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyContributions = await ChamaContribution.aggregate([
      {
        $lookup: {
          from: 'chamamembers',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member'
        }
      },
      {
        $match: {
          'member.chamaId': chamaId,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active loans
    const activeLoans = await ChamaLoan.countDocuments({ chamaId, status: 'active' });

    res.json({
      chama,
      memberCount,
      monthlyContributions: monthlyContributions[0]?.total || 0,
      contributionCount: monthlyContributions[0]?.count || 0,
      activeLoans
    });
  } catch (error) {
    console.error('Error getting chama overview:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Platform analytics (admin only)
const getPlatformOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalChamas = await Chama.countDocuments({ status: 'active' });
    
    const totalSavings = await ChamaContribution.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalInvestments = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountInvested' } } }
    ]);

    const activeLoans = await ChamaLoan.countDocuments({ status: 'active' });

    // Get monthly growth
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalUsers,
      totalChamas,
      totalSavings: totalSavings[0]?.total || 0,
      totalInvestments: totalInvestments[0]?.total || 0,
      activeLoans,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Error getting platform overview:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserDashboard,
  getUserSavingsAnalytics,
  getUserInvestmentAnalytics,
  getChamaOverview,
  getPlatformOverview,
  // Add other analytics methods here...
};
