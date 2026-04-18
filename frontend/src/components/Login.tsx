import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface LoginProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
  errorMessage: string | null;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onError, errorMessage }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div className="job-card" style={{ maxWidth: '450px', width: '100%', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          Student Access
        </h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
          This internship portal is strictly restricted to verified full-time students of <b>BITS Pilani</b>. 
          Please sign in using your official institution email (@bits-pilani.ac.in).
        </p>

        {errorMessage && (
          <div style={{
            background: 'var(--color-destructive)',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                onSuccess(credentialResponse.credential);
              } else {
                onError();
              }
            }}
            onError={onError}
            useOneTap
            shape="rectangular"
            theme="filled_blue"
            text="continue_with"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
