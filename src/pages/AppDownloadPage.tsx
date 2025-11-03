import React from 'react';
import { Helmet } from 'react-helmet-async';
import AppDownload from '@/components/AppDownload';

const AppDownloadPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Download ChamaVault - Smart Community Finance App</title>
        <meta 
          name="description" 
          content="Download ChamaVault mobile app for Android, iOS, and web. Get instant access to the best Chama management and financial platform in Kenya. Available on Google Play and App Store." 
        />
        <meta name="keywords" content="ChamaVault download, Chama app, mobile banking Kenya, savings group app, financial management, M-Pesa integration" />
        <meta property="og:title" content="Download ChamaVault - Smart Community Finance App" />
        <meta property="og:description" content="Get ChamaVault on your mobile device. Trusted by 10,000+ users for Chama management, savings, and investments." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Download ChamaVault App" />
        <meta name="twitter:description" content="The most trusted Chama management platform. Download now for Android, iOS, and web." />
      </Helmet>
      <main>
        <AppDownload />
      </main>
    </>
  );
};

export default AppDownloadPage;