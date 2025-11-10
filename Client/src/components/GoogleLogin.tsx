import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import googleLoginService from "../services/login.service";
import { useState } from "react";
import { useUserStore } from "../store/userStore";



const GLogin = () => {
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
      };

      useUserStore.getState().setUser(userInfo, response.token); 
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };


  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>

  );
};

export default GLogin;


