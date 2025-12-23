import type { FC } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import googleLoginService from "../../services/login.service";
import { useUserStore } from "../../store/userStore";

interface GLoginProps {
  onSuccess?: () => void;
}

const GLogin: FC<GLoginProps> = ({ onSuccess }) => {

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    const token = credentialResponse.credential;
    const decoded: any = jwtDecode(token);
    try {
      const response = await googleLoginService.googleLogin(token);
      const userInfo = {
        _id: response.user._id,
        firstName: response.user.firstName,
        googleId: decoded.sub || response.user.googleId,
        avatar: response.user.avatar,
        role: response.user.role,
      };
      useUserStore.getState().setUser(userInfo, response.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };


  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
      />
    </div>

  );
};

export default GLogin;


