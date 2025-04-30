import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const ForgotPassword = ({ onSuccess }) => {
  const { forgotPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
      if (onSuccess) onSuccess(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Reset Password</h2>
      
      {sent ? (
        <div className="auth-success">
          A password reset code has been sent to your email address.
        </div>
      ) : (
        <>
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;