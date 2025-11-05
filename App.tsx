
import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { FormCheckerPage } from './pages/FormCheckerPage';
import { DailyUpdatePage } from './pages/DailyUpdatePage';
import { ProgressBookPage } from './pages/ProgressBookPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export type Page = 'landing' | 'form-checker' | 'daily-update' | 'progress-book';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('landing');

    const navigate = (page: Page) => {
        setCurrentPage(page);
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'form-checker':
                return <FormCheckerPage />;
            case 'daily-update':
                return <DailyUpdatePage />;
            case 'progress-book':
                return <ProgressBookPage />;
            case 'landing':
            default:
                return <LandingPage onNavigate={navigate} />;
        }
    };
    
    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col">
            <Header
              onHomeClick={() => navigate('landing')}
              showHistoryButton={currentPage === 'form-checker'}
              showBackButton={currentPage !== 'landing'}
            />
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 md:px-8 py-4">
                <div className="w-full max-w-7xl">
                    {renderContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;