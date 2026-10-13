export default function LoginSocial({ onSocial }) {
  return <>
    <div className="bc-social-divider"><span>Or continue with</span></div>
    <div className="bc-social-row">
      <button type="button" onClick={() => onSocial('Google')} className="bc-social-btn">
        <span className="bc-google-g" aria-hidden="true">G</span> Continue with Google
      </button>
      <button type="button" onClick={() => onSocial('Facebook')} className="bc-social-btn">
        <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="12" fill="#1877F2" />
  <path
    d="M13.6 20v-7h2.3l.4-2.8h-2.7V8.4c0-.8.3-1.4 1.4-1.4h1.4V4.5c-.6-.1-1.3-.2-2.1-.2-2.5 0-4 1.5-4 4.2v1.7H8V13h2.3v7z"
    fill="#ffffff"
  />
</svg>
Continue with Facebook
      </button>
    </div>
  </>;
}
