import { useCallback } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { OAuthProviderIcon } from "@/components/auth/OAuthProviderIcon";

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
        <OAuthProviderIcon provider="GOOGLE" size={22} />
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
