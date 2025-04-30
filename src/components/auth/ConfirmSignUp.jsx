import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const ConfirmSignUp = ({ email, onSuccess }) => {
  const { confirmSignUp } = useAuthContext();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp(email, code);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Confirm Sign Up</h2>
      <p>We've sent a confirmation code to your email address. Please enter it below.</p>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="code">Confirmation Code:</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Confirming...' : 'Confirm Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default ConfirmSignUp;