import React, { useEffect } from 'react';
import { getAuth, sendEmailVerification } from 'firebase/auth';

const EmailVerification = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          window.location.reload(); 
        }
      }
    }, 3000); 

    return () => clearInterval(interval); 
  }, [auth]);

  const handleResendVerificationEmail = () => {
    if (user) {
      sendEmailVerification(user)
        .then(() => {
          alert('Verification email sent!');
        })
        .catch((error) => {
          alert(`Error: ${error.message}`);
        });
    }
  };

  return (
    <div className="email-verification-banner">
      <p>
        Your email is not verified. Please check your inbox or click{' '}
        <button onClick={handleResendVerificationEmail}>here</button> to resend the verification email.
      </p>
    </div>
  );
};

export default EmailVerification;
