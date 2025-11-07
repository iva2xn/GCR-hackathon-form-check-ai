

import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { FormCheckerPage } from './pages/FormCheckerPage';
import { DailyUpdatePage } from './pages/DailyUpdatePage';
import { ProgressBookPage } from './pages/ProgressBookPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export type Page = 'landing' | 'form-checker' | 'daily-update' | 'progress-book';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('landing');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isUpdateHistoryOpen, setIsUpdateHistoryOpen] = useState(false);

    useEffect(() => {
        if (currentPage !== 'form-checker') {
            setIsHistoryOpen(false);
        }
        if (currentPage !== 'progress-book') {
            setIsUpdateHistoryOpen(false);
        }
    }, [currentPage]);

    const navigate = (page: Page, options?: { openHistory?: boolean; openUpdateHistory?: boolean }) => {
        setCurrentPage(page);
        if (page === 'form-checker' && options?.openHistory) {
            setIsHistoryOpen(true);
        }
        if (page === 'progress-book' && options?.openUpdateHistory) {
            setIsUpdateHistoryOpen(true);
        }
    };

    const handleToggleHistory = () => {
        setIsHistoryOpen(prev => !prev);
    };

    const handleToggleUpdateHistory = () => {
        setIsUpdateHistoryOpen(prev => !prev);
    };
    
    const handleAddUpdateClick = () => {
        navigate('daily-update');
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'form-checker':
                return <FormCheckerPage isHistoryOpen={isHistoryOpen} onToggleHistory={handleToggleHistory} />;
            case 'daily-update':
                return <DailyUpdatePage />;
            case 'progress-book':
                return <ProgressBookPage isHistoryOpen={isUpdateHistoryOpen} onToggleHistory={handleToggleUpdateHistory} onNavigate={navigate} />;
            case 'landing':
            default:
                return <LandingPage onNavigate={navigate} />;
        }
    };
    
    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col">
            <Header
              onHomeClick={() => navigate('landing')}
              showHistoryButton={currentPage === 'form-checker' || currentPage === 'progress-book'}
              onToggleHistory={currentPage === 'form-checker' ? handleToggleHistory : handleToggleUpdateHistory}
              showBackButton={currentPage !== 'landing'}
              showAddUpdateButton={currentPage === 'progress-book'}
              onAddUpdateClick={handleAddUpdateClick}
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