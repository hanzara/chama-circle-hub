
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"ChamaVault" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to ChamaVault!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to ChamaVault, ${userName}!</h2>
        <p>Thank you for joining our community-driven financial platform.</p>
        <p>With ChamaVault, you can:</p>
        <ul>
          <li>Join and manage chamas</li>
          <li>Track your savings and contributions</li>
          <li>Access loans and investment opportunities</li>
          <li>Connect with your community</li>
        </ul>
        <p>Get started by completing your profile and joining your first chama!</p>
        <a href="${process.env.FRONTEND_URL}/profile" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Complete Profile
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
    `;
    
    return this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    const subject = 'Reset Your Password - ChamaVault';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested to reset your password for your ChamaVault account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this URL into your browser: ${resetUrl}
        </p>
      </div>
    `;
    
    return this.sendEmail(userEmail, subject, html);
  }

  async sendContributionReminder(userEmail, userName, chamaName, amount, dueDate) {
    const subject = `Contribution Reminder - ${chamaName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Contribution Reminder</h2>
        <p>Hi ${userName},</p>
        <p>This is a friendly reminder that your contribution for <strong>${chamaName}</strong> is due.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount Due:</strong> KES ${amount.toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        <p>Make your contribution today to avoid late fees and maintain your good standing in the chama.</p>
        <a href="${process.env.FRONTEND_URL}/chamas" 
           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Make Contribution
        </a>
      </div>
    `;
    
    return this.sendEmail(userEmail, subject, html);
  }

  async sendLoanApprovalEmail(userEmail, userName, loanAmount, interestRate) {
    const subject = 'Loan Application Approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Congratulations! Your Loan is Approved</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Your loan application has been approved.</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p><strong>Loan Amount:</strong> KES ${loanAmount.toLocaleString()}</p>
          <p><strong>Interest Rate:</strong> ${interestRate}% per annum</p>
        </div>
        <p>The funds will be disbursed to your account within 24 hours.</p>
        <a href="${process.env.FRONTEND_URL}/loans" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Loan Details
        </a>
      </div>
    `;
    
    return this.sendEmail(userEmail, subject, html);
  }

  async sendMonthlyStatement(userEmail, userName, chamaName, contributionData) {
    const subject = `Monthly Statement - ${chamaName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Monthly Statement</h2>
        <p>Hi ${userName},</p>
        <p>Here's your monthly statement for <strong>${chamaName}</strong>:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Total Contributions This Month:</strong> KES ${contributionData.monthlyTotal.toLocaleString()}</p>
          <p><strong>Total Contributions to Date:</strong> KES ${contributionData.totalToDate.toLocaleString()}</p>
          <p><strong>Chama Total Savings:</strong> KES ${contributionData.chamaTotalSavings.toLocaleString()}</p>
        </div>
        <p>Keep up the great work saving with your community!</p>
        <a href="${process.env.FRONTEND_URL}/chamas/${contributionData.chamaId}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Full Statement
        </a>
      </div>
    `;
    
    return this.sendEmail(userEmail, subject, html);
  }

  async sendInvestmentUpdate(userEmail, userName, investmentTitle, updateType, amount) {
    const subject = `Investment Update - ${investmentTitle}`;
    const color = updateType === 'return' ? '#10b981' : '#2563eb';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">Investment Update</h2>
        <p>Hi ${userName},</p>
        <p>We have an update on your investment in <strong>${investmentTitle}</strong>:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Update Type:</strong> ${updateType === 'return' ? 'Return Payment' : 'Investment Update'}</p>
          <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/investments" 
           style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Investment
        </a>
      </div>
    `;
    
    return this.sendEmail(userEmail, subject, html);
  }
}

module.exports = new EmailService();
