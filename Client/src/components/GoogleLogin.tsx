import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import googleLoginService from "../services/googleLogin.service";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
// import { User } from "../../models/user.model";
// import { useUser } from "../../hooks/UserProvider";
// import { Product } from "../../models/product.model";


const GLogin = () => {
  // const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  // const [userData, setUserData] = useState<User>(new User('', '', '', ''));
  // const { setUserInfo } = useUser()

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    // מפענחים את המידע שהגיע מטוקן גוגל
    const token = credentialResponse.credential;

    const decoded: any = jwtDecode(token);
    console.log("User info:", decoded);

    // const newUser = new User('', '', decoded.email || '', decoded.name || '');
    // setUserData(newUser);

    try {
      const response = await googleLoginService.googleLogin(token);
      console.log("Server response:", response.isNewUser);
      if (response.isNewUser) {
        console.log("New user detected, showing additional form");
        // setShowAdditionalForm(true);
      } else {
        // משתמש קיים → שמירה ב־Context והמשך רגיל
        console.log("Existing user:", response.data);
        console.log("User ID:", response.user);
        // setUserInfo(response.user.ID, response.user.fullName, response.user.role)
      }
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


