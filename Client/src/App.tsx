// import react from 'react'
// import Home from './components/Home'
// import GLogin from './components/GoogleLogin'
// import { GoogleOAuthProvider } from '@react-oauth/google'
// import Profile from './components/user/Profile';

// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
// console.log("Google Client ID:", clientId);


// function App() {
//   console.log("App component rendered");

//   return (
//     <>
//       {/* <GoogleOAuthProvider clientId={clientId}>
//         <div>
//           <GLogin  />
//         </div>
//       </GoogleOAuthProvider> */}
//       <Profile/>
//       {/* <Home /> */}
//     </>
//   )
// }

// export default App
import React from "react";
import { Container } from "@mui/material";
import { ItinerarySummary } from "./components/tripPlan/ItinerarySummary";

const itinerary = [
  { name: "Rome", notes: "Visit the Colosseum and enjoy gelato." },
  { name: "Florence", notes: "Admire the Duomo and explore local art." },
  { name: "Venice", notes: "Ride a gondola through the canals." },
];

export default function App() {
  return (
    <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
      <ItinerarySummary items={itinerary} title="Italian Adventure 🇮🇹"  discription="bla blka bla bla"/>
    </Container>
  );
}
