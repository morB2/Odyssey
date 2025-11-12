import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Grid,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import { Mail, Lock, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left side image with orange gradient overlay */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}

        sx={{
          position: "relative",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1660315250109-075f6b142ebc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 🔸 Orange-to-black gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom right, rgba(234,88,12,0.8), rgba(0,0,0,0.6))",
          }}
        />
        {/* Text content on top */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            p: 4,
            textAlign: "center",
            zIndex: 1,
          }}
        >
          <Typography variant="h3" fontWeight="bold" mb={2}>
            Wanderlust Travels
          </Typography>
          <Typography variant="body1" maxWidth="400px">
            Your adventure awaits. Reset your password to continue exploring the world.
          </Typography>
        </Box>
      </Grid>

      {/* Right side form */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}

        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "white",
          p: { xs: 4, md: 8 },
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
          <Link
            component="button"
            onClick={() => navigate(-1)}
            underline="none"
            sx={{ display: "inline-flex", alignItems: "center", color: "#e67e00", fontWeight: 500, mb: 3 }}
          >
            <ArrowBack fontSize="small" sx={{ mr: 1 }} />
            Back to login
          </Link>

          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ bgcolor: "orange", mr: 2 }}>
              <Lock />
            </Avatar>
            <Box>
              <Typography variant="h5">Forgot Password?</Typography>
              <Typography color="text.secondary" variant="body2">
                No worries, we’ll help you reset it
              </Typography>
            </Box>
          </Box>

          {!isSubmitted ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                variant="subtitle2"
                color="text.primary"
                sx={{ mb: 1, mt: 2 }}
              >
                Email Address
              </Typography>
              <Box display="flex" alignItems="center" position="relative" mb={1}>
                <Mail
                  sx={{
                    position: "absolute",
                    left: 10,
                    color: "gray",
                    fontSize: 20,
                  }}
                />
                <TextField
                  fullWidth
                  required
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ sx: { pl: 4 } }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                We’ll send you a link to reset your password.
              </Typography>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  bgcolor: "orange",
                  "&:hover": { bgcolor: "#e67e00" },
                }}
              >
                Send Reset Link
              </Button>

              <Typography
                align="center"
                variant="body2"
                sx={{ mt: 3 }}
                color="text.secondary"
              >
                Remember your password?{" "}
                <Link
                  href="#"
                  underline="hover"
                  sx={{ color: "orange", fontWeight: 500 }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          ) : (
            <Box
              textAlign="center"
              p={4}
              sx={{
                bgcolor: "#fff7ec",
                border: "2px solid orange",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  bgcolor: "orange",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Mail sx={{ color: "white", fontSize: 40 }} />
              </Box>
              <Typography variant="h6" color="text.primary" mb={1}>
                Check Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                We’ve sent a password reset link to{" "}
                <Typography component="span" color="text.primary" fontWeight={500}>
                  {email}
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Didn’t receive the email? Check your spam folder or{" "}
                <Link
                  component="button"
                  underline="hover"
                  sx={{ color: "orange" }}
                  onClick={() => setIsSubmitted(false)}
                >
                  try again
                </Link>
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          <Typography align="center" variant="caption" color="text.secondary">
            Need help? Contact our{" "}
            <Link href="#" underline="hover" sx={{ color: "orange" }}>
              support team
            </Link>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}