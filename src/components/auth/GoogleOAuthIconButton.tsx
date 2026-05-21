import { useCallback } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type GoogleOAuthIconButtonProps = {
  disabled?: boolean;
  onSuccess: (credential: string) => void;
  onError: () => void;
};

/** Custom Google icon (UI-matched); invisible gsi icon overlay handles the click. */
export function GoogleOAuthIconButton({
  disabled = false,
  onSuccess,
  onError,
}: GoogleOAuthIconButtonProps) {
  const handleSuccess = useCallback(
    (res: CredentialResponse) => {
      if (res.credential) onSuccess(res.credential);
      else onError();
    },
    [onError, onSuccess],
  );

  return (
    <div
      className={`oauth-icon-hit oauth-icon-hit--google${disabled ? " oauth-icon-hit--disabled" : ""}`}
      title="Continue with Google"
    >
      <span className="oauth-icon-svg oauth-icon-svg--google" aria-hidden>
        <GoogleMarkSvg />
      </span>
      {!disabled ? (
        <div className="oauth-icon-google-overlay" aria-hidden>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={onError}
            type="icon"
            shape="circle"
            size="medium"
            theme="outline"
          />
        </div>
      ) : null}
    </div>
  );
}

function GoogleMarkSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="var(--oauth-google-blue, #7eb8e8)"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="var(--oauth-google-green, #8fd4a8)"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="var(--oauth-google-yellow, #e8d47a)"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="var(--oauth-google-red, #e8a0a0)"
      />
    </svg>
  );
}
