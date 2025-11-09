import react from 'react'
import Home from './components/Home'
import GLogin from './components/GoogleLogin'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Profile from './components/user/Profile';
import MainPage from './components/tripPlan/MainPage';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
console.log("Google Client ID:", clientId);


function App() {
  console.log("App component rendered");

  return (
    <>
      {/* <GoogleOAuthProvider clientId={clientId}>
        <div>
          <GLogin  />
        </div>
      </GoogleOAuthProvider> */}
     <MainPage/>
      {/* <Home /> */}
    </>
  )
}

export default App
