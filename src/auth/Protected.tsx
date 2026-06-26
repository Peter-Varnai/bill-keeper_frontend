import React from 'react';
import { useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';

export const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#008080',
            }}>
                <div style={{
                    padding: '24px',
                    backgroundColor: '#c0c0c0',
                    border: '2px outset #fff',
                    fontSize: '14px',
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <>{children}</>;
};
