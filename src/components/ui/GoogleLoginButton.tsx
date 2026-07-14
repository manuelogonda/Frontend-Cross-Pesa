
// This is the button that triggers the redirect to Spring Security
export const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // This triggers the redirect to the backend endpoint we configured
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 w-full border border-slate-300 py-2 rounded-lg hover:bg-slate-50 transition"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
};