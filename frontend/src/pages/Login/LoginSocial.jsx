
export default function LoginSocial({ onSocial }) {
  return (
    <>
      <div className="bc-social-divider">
        <span>Or continue with</span>
      </div>

      <div className="bc-social-row">
        <button
          type="button"
          onClick={() => onSocial("Google")}
          className="bc-social-btn"
        >
          <span className="bc-google-g" aria-hidden="true">G</span>
          Continue with Google
        </button>

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
