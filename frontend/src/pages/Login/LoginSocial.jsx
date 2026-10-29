
import { GoogleLogin } from '@react-oauth/google';

export default function LoginSocial({
  onSocial,
  onGoogle,
  onGoogleError
}) {
  return (
    <>
      <div className="bc-social-divider">
        <span>Or continue with</span>
      </div>

      <div className="bc-social-row">

        {/* Google Login */}
        <div
          style={{
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) {
                onGoogle?.(response.credential);
              } else {
                onGoogleError?.();
              }
            }}
            onError={() => onGoogleError?.()}
            type="standard"
            text="continue_with"
            theme="outline"
            size="large"
            shape="rectangular"
          />
        </div>

        {/* Facebook - unchanged */}
        <button
          type="button"
          onClick={() => onSocial("Facebook")}
          className="bc-social-btn"
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 23,
              height: 23,
              borderRadius: "50%",
              background: "#1877F2",
              color: "white",
              fontWeight: "bold",
              fontSize: 17
            }}
          >
            f
          </span>
          Continue with Facebook
        </button>

      </div>
    </>
  );
}
