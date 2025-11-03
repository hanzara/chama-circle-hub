
const axios = require('axios');
const MpesaTransaction = require('../models/MpesaTransaction');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.environment = process.env.NODE_ENV === 'production' ? 'api' : 'sandbox';
    this.baseUrl = `https://${this.environment}.safaricom.co.ke`;
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  async initiateSTKPush(phoneNumber, amount, userId, accountReference = 'ChamaVault', transactionDesc = 'Payment') {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      // Ensure phone number is in correct format
      const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : 
                           phoneNumber.startsWith('0') ? `254${phoneNumber.slice(1)}` : 
                           `254${phoneNumber}`;

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.BACKEND_URL}/api/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Save transaction to database
      const transaction = new MpesaTransaction({
        userId,
        transactionType: 'stk_push',
        amount,
        phoneNumber: formattedPhone,
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        accountReference,
        transactionDesc,
        status: 'pending',
      });

      await transaction.save();

      return {
        success: true,
        message: 'STK Push initiated successfully',
        data: {
          transactionId: transaction._id,
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
        },
      };
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate STK Push');
    }
  }

  async checkTransactionStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Transaction status check error:', error.response?.data || error.message);
      throw new Error('Failed to check transaction status');
    }
  }

  async sendMoneyB2C(phoneNumber, amount, commandID = 'BusinessPayment', remarks = 'Payment') {
    try {
      const accessToken = await this.getAccessToken();
      
      // Format phone number
      const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : 
                           phoneNumber.startsWith('0') ? `254${phoneNumber.slice(1)}` : 
                           `254${phoneNumber}`;

      const requestBody = {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: commandID,
        Amount: Math.round(amount),
        PartyA: this.shortcode,
        PartyB: formattedPhone,
        Remarks: remarks,
        QueueTimeOutURL: `${process.env.BACKEND_URL}/api/mpesa/b2c/timeout`,
        ResultURL: `${process.env.BACKEND_URL}/api/mpesa/b2c/result`,
        Occasion: remarks,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        message: 'B2C transaction initiated successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('B2C error:', error.response?.data || error.message);
      throw new Error('Failed to initiate B2C transaction');
    }
  }

  async registerC2BUrls() {
    try {
      const accessToken = await this.getAccessToken();

      const requestBody = {
        ShortCode: this.shortcode,
        ResponseType: 'Completed',
        ConfirmationURL: `${process.env.BACKEND_URL}/api/mpesa/c2b/confirmation`,
        ValidationURL: `${process.env.BACKEND_URL}/api/mpesa/c2b/validation`,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/c2b/v1/registerurl`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        message: 'C2B URLs registered successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('C2B URL registration error:', error.response?.data || error.message);
      throw new Error('Failed to register C2B URLs');
    }
  }

  async reverseTransaction(transactionID, amount, receiverParty) {
    try {
      const accessToken = await this.getAccessToken();

      const requestBody = {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'TransactionReversal',
        TransactionID: transactionID,
        Amount: Math.round(amount),
        ReceiverParty: receiverParty,
        RecieverIdentifierType: '11',
        ResultURL: `${process.env.BACKEND_URL}/api/mpesa/reversal/result`,
        QueueTimeOutURL: `${process.env.BACKEND_URL}/api/mpesa/reversal/timeout`,
        Remarks: 'Transaction Reversal',
        Occasion: 'Transaction Reversal',
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/reversal/v1/request`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        message: 'Transaction reversal initiated successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction reversal error:', error.response?.data || error.message);
      throw new Error('Failed to reverse transaction');
    }
  }

  async checkAccountBalance() {
    try {
      const accessToken = await this.getAccessToken();

      const requestBody = {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'AccountBalance',
        PartyA: this.shortcode,
        IdentifierType: '4',
        Remarks: 'Account Balance Check',
        QueueTimeOutURL: `${process.env.BACKEND_URL}/api/mpesa/balance/timeout`,
        ResultURL: `${process.env.BACKEND_URL}/api/mpesa/balance/result`,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/accountbalance/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        message: 'Balance inquiry initiated successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('Balance inquiry error:', error.response?.data || error.message);
      throw new Error('Failed to check account balance');
    }
  }

  calculateCharges(amount) {
    // M-Pesa charges based on amount tiers
    let mpesaFee = 0;
    
    if (amount <= 100) mpesaFee = 0;
    else if (amount <= 500) mpesaFee = 7;
    else if (amount <= 1000) mpesaFee = 13;
    else if (amount <= 1500) mpesaFee = 23;
    else if (amount <= 2500) mpesaFee = 33;
    else if (amount <= 3500) mpesaFee = 53;
    else if (amount <= 5000) mpesaFee = 57;
    else if (amount <= 7500) mpesaFee = 78;
    else if (amount <= 10000) mpesaFee = 90;
    else if (amount <= 15000) mpesaFee = 108;
    else if (amount <= 20000) mpesaFee = 115;
    else if (amount <= 25000) mpesaFee = 119;
    else if (amount <= 30000) mpesaFee = 124;
    else if (amount <= 35000) mpesaFee = 129;
    else if (amount <= 40000) mpesaFee = 134;
    else if (amount <= 45000) mpesaFee = 139;
    else if (amount <= 50000) mpesaFee = 144;
    else mpesaFee = 149;

    const platformFee = Math.round(amount * 0.005); // 0.5% platform fee
    const totalCharges = mpesaFee + platformFee;

    return {
      mpesaFee,
      platformFee,
      totalCharges,
    };
  }
}

module.exports = new MpesaService();
