import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sw' | 'sheng' | 'giriama';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.chamas': 'Chamas', 
    'nav.analytics': 'Analytics',
    'nav.create': 'Create',
    'nav.welcome': 'Welcome',
    'nav.signOut': 'Sign Out',
    'nav.signIn': 'Sign In',
    
    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.subtitle': 'Track your financial progress',
    'analytics.total.savings': 'Total Savings',
    'analytics.monthly.growth': 'Monthly Growth',
    'analytics.active.chamas': 'Active Chamas',
    'analytics.next.payment': 'Next Payment',
    'analytics.days.remaining': 'Days remaining',
    'analytics.performing.well': 'All performing well',
    'analytics.no.chamas': 'No active chamas',
    'analytics.annual.return': 'Annual return rate',
    'analytics.contribution.trends': 'Contribution Trends',
    'analytics.monthly.contributions': 'Your monthly contributions over time',
    'analytics.chama.performance': 'Chama Performance',
    'analytics.contributions.by.chama': 'Contributions by Chama group',
    'analytics.financial.goals': 'Financial Goals Progress',
    'analytics.track.progress': 'Track your progress towards financial milestones',
    'analytics.recent.activity': 'Recent Activity Summary',
    'analytics.contribution.made': 'Contribution Made',
    'analytics.no.data': 'No contribution data available',
    'analytics.no.chama.data': 'No chama data available',
    'analytics.no.recent.activity': 'No recent activity found',
    
    // Goals
    'goals.house': 'House Deposit',
    'goals.emergency': 'Emergency Fund',
    'goals.business': 'Business Capital',

    // Dashboard
    'dashboard.net.worth': 'Net Worth',
    'dashboard.upcoming.contributions': 'Upcoming Contributions',
    'dashboard.pending.votes': 'Pending Votes',
    'dashboard.roi': 'ROI',
    'dashboard.repayment.performance': 'Repayment Performance',
    'member.reputation': 'Member Reputation'
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.chamas': 'Chama',
    'nav.analytics': 'Uchambuzi',
    'nav.create': 'Unda',
    'nav.welcome': 'Karibu',
    'nav.signOut': 'Toka',
    'nav.signIn': 'Ingia',
    
    // Analytics
    'analytics.title': 'Dashibodi ya Uchambuzi',
    'analytics.subtitle': 'Fuatilia maendeleo yako ya kifedha',
    'analytics.total.savings': 'Jumla ya Akiba',
    'analytics.monthly.growth': 'Ukuaji wa Kila Mwezi',
    'analytics.active.chamas': 'Chama Zinazofanya Kazi',
    'analytics.next.payment': 'Malipo Yanayofuata',
    'analytics.days.remaining': 'Siku zilizobaki',
    'analytics.performing.well': 'Zote zinafanya vizuri',
    'analytics.no.chamas': 'Hakuna chama zinazofanya kazi',
    'analytics.annual.return': 'Kiwango cha kurudi kila mwaka',
    'analytics.contribution.trends': 'Mwelekeo wa Michango',
    'analytics.monthly.contributions': 'Michango yako ya kila mwezi kwa muda',
    'analytics.chama.performance': 'Utendaji wa Chama',
    'analytics.contributions.by.chama': 'Michango kwa kundi la Chama',
    'analytics.financial.goals': 'Maendeleo ya Malengo ya Kifedha',
    'analytics.track.progress': 'Fuatilia maendeleo yako kuelekea alama za kifedha',
    'analytics.recent.activity': 'Muhtasari wa Shughuli za Hivi Karibuni',
    'analytics.contribution.made': 'Mchango Umefanywa',
    'analytics.no.data': 'Hakuna data ya michango inapatikana',
    'analytics.no.chama.data': 'Hakuna data ya chama inapatikana',
    'analytics.no.recent.activity': 'Hakuna shughuli za hivi karibuni',
    
    // Goals
    'goals.house': 'Amana ya Nyumba',
    'goals.emergency': 'Fedha za Dharura',
    'goals.business': 'Mtaji wa Biashara',

    // Dashboard
    'dashboard.net.worth': 'Thamani Halisi',
    'dashboard.upcoming.contributions': 'Michango Inayokuja',
    'dashboard.pending.votes': 'Kura Zinazongoja',
    'dashboard.roi': 'Faida',
    'dashboard.repayment.performance': 'Utendaji wa Kulipa',
    'member.reputation': 'Sifa za Mjumbe'
  },
  sheng: {
    // Navigation
    'nav.home': 'Home',
    'nav.chamas': 'Chama',
    'nav.analytics': 'Analytics',
    'nav.create': 'Tengeneza',
    'nav.welcome': 'Sasa',
    'nav.signOut': 'Toka',
    'nav.signIn': 'Ingia',
    
    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.subtitle': 'Angalia progress ya doo yako',
    'analytics.total.savings': 'Jumla ya Doo',
    'analytics.monthly.growth': 'Growth ya Kila Month',
    'analytics.active.chamas': 'Chama Active',
    'analytics.next.payment': 'Payment Inayokam',
    'analytics.days.remaining': 'Siku zimebaki',
    'analytics.performing.well': 'Zote zinado poa',
    'analytics.no.chamas': 'Hakuna chama active',
    'analytics.annual.return': 'Return ya kila year',
    'analytics.contribution.trends': 'Trend za Contribution',
    'analytics.monthly.contributions': 'Contribution zako za kila month',
    'analytics.chama.performance': 'Performance ya Chama',
    'analytics.contributions.by.chama': 'Contribution kwa group ya Chama',
    'analytics.financial.goals': 'Progress ya Goals za Doo',
    'analytics.track.progress': 'Track progress yako ya goals za doo',
    'analytics.recent.activity': 'Activity za Siku Hizi',
    'analytics.contribution.made': 'Contribution Imefanywa',
    'analytics.no.data': 'Hakuna data ya contribution',
    'analytics.no.chama.data': 'Hakuna data ya chama',
    'analytics.no.recent.activity': 'Hakuna activity za siku hizi',
    
    // Goals
    'goals.house': 'Deposit ya Nyumba',
    'goals.emergency': 'Doo ya Emergency',
    'goals.business': 'Capital ya Biashara',

    // Dashboard
    'dashboard.net.worth': 'Net Worth',
    'dashboard.upcoming.contributions': 'Contribution Zinakam',
    'dashboard.pending.votes': 'Votes Zimengoja',
    'dashboard.roi': 'ROI',
    'dashboard.repayment.performance': 'Performance ya Kulipa',
    'member.reputation': 'Reputation ya Member'
  },
  giriama: {
    // Navigation (keeping some English for now - can be translated more later)
    'nav.home': 'Mudzi',
    'nav.chamas': 'Chama',
    'nav.analytics': 'Analytics',
    'nav.create': 'Umba',
    'nav.welcome': 'Karibu',
    'nav.signOut': 'Soka',
    'nav.signIn': 'Ngia',
    
    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.subtitle': 'Ona maendeleo ga hela yako',
    'analytics.total.savings': 'Jumla ya Akiba',
    'analytics.monthly.growth': 'Kukua kwa Mwezi',
    'analytics.active.chamas': 'Chama Hai',
    'analytics.next.payment': 'Malipo Galakuja',
    'analytics.days.remaining': 'Siku zimerema',
    'analytics.performing.well': 'Zose zinafanya kuheri',
    'analytics.no.chamas': 'Kugwi chama hai',
    'analytics.annual.return': 'Kurudi kwa mwaka',
    'analytics.contribution.trends': 'Muelekeo wa Michango',
    'analytics.monthly.contributions': 'Michango yako ya kila mwezi',
    'analytics.chama.performance': 'Utendaji wa Chama',
    'analytics.contributions.by.chama': 'Michango kwa kikundi cha Chama',
    'analytics.financial.goals': 'Maendeleo ga Malengo ga Hela',
    'analytics.track.progress': 'Ona maendeleo yako ga malengo ga hela',
    'analytics.recent.activity': 'Shughuli za Siku Hizi',
    'analytics.contribution.made': 'Mchango Umefanywa',
    'analytics.no.data': 'Kugwi data ya michango',
    'analytics.no.chama.data': 'Kugwi data ya chama',
    'analytics.no.recent.activity': 'Kugwi shughuli za siku hizi',
    
    // Goals
    'goals.house': 'Amana ya Nyumba',
    'goals.emergency': 'Hela za Hatari',
    'goals.business': 'Mtaji wa Biashara',

    // Dashboard
    'dashboard.net.worth': 'Thamani Halisi',
    'dashboard.upcoming.contributions': 'Michango Galakuja',
    'dashboard.pending.votes': 'Kura Zimerema',
    'dashboard.roi': 'Faida',
    'dashboard.repayment.performance': 'Utendaji wa Kulipa',
    'member.reputation': 'Sifa za Mjumbe'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, fallback?: string): string => {
    const value = translations[language]?.[key];
    return value || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
