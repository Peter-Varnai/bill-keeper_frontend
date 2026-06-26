import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export const LoginPage: React.FC = () => {
    const { login, register } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePassword = (pw: string): string | null => {
        if (pw.length < 6) return 'Password must be at least 6 characters';
        if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedUser = username.trim();
        if (!trimmedUser) {
            setError('Username is required');
            return;
        }

        if (isRegistering) {
            const pwError = validatePassword(password);
            if (pwError) {
                setError(pwError);
                return;
            }
        }

        if (!password) {
            setError('Password is required');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isRegistering) {
                await register(trimmedUser, password);
            } else {
                await login(trimmedUser, password);
            }
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'An error occurred';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#008080',
        }}>
            <div style={{
                width: '400px',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
                padding: '0',
                boxShadow: '4px 4px 0 #000',
            }}>
                <div style={{
                    backgroundColor: '#000080',
                    color: '#fff',
                    padding: '4px 6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span>Bill Keeper — {isRegistering ? 'Register' : 'Login'}</span>
                </div>

                <div style={{ padding: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '14px',
                                    border: '2px inset #fff',
                                    backgroundColor: '#fff',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '14px',
                                    border: '2px inset #fff',
                                    backgroundColor: '#fff',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '8px',
                                backgroundColor: '#fff',
                                border: '2px inset #fff',
                                color: '#8b0000',
                                fontSize: '13px',
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError(null);
                                }}
                                disabled={isSubmitting}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    backgroundColor: '#c0c0c0',
                                    border: '2px outset #fff',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {isRegistering ? 'Back to Login' : 'Create Account'}
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '8px 24px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#c0c0c0',
                                    border: '2px outset #fff',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {isSubmitting ? '...' : isRegistering ? 'Register' : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
