import { useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Typography,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Divider,
    Link,
} from "@mui/material";
import {
    Lock,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Cancel,
} from "@mui/icons-material";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const passwordRequirements = [
        { text: "At least 8 characters", met: password.length >= 8 },
        { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
        { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
        { text: "Contains number", met: /[0-9]/.test(password) },
    ];

    const passwordsMatch = password === confirmPassword && confirmPassword !== "";
    const allRequirementsMet = passwordRequirements.every((req) => req.met);
    const canSubmit = allRequirementsMet && passwordsMatch;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canSubmit) {
            setIsSubmitted(true);
            setTimeout(() => {
                // Redirect or reset state here
            }, 2000);
        }
    };

    return (
        <Grid container sx={{ minHeight: "100vh" }}>
            {/* Left Side - Image with Overlay */}
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
                    height: { xs: 300, md: "100vh" },
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to bottom right, rgba(234, 88, 12, 0.8), rgba(0, 0, 0, 0.6))",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 4,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {/* replace src with your logo path or URL */}
                            <Box
                                component="img"
                                src="/logo-white-new-caption.png"
                                alt="Logo"
                                sx={{ width: 300, height: 300, objectFit: "contain" }}
                            />
                        </Box>
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: 400 }}>
                        Create a secure password to protect your account and continue your journey.
                    </Typography>
                </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid
                size={{
                    xs: 12,
                    md: 6
                }}

                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ p: { xs: 4, md: 8 }, bgcolor: "white" }}
            >
                <Box sx={{ width: "100%", maxWidth: 420 }}>
                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                                <Box
                                    sx={{
                                        bgcolor: "orange.main",
                                        color: "white",
                                        p: 1.5,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    <Lock />
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ color: "black" }}>
                                        Reset Your Password
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Enter your new password below
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Form */}
                            <Box component="form" onSubmit={handleSubmit}>
                                {/* Password */}
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="disabled" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Password Requirements */}
                                {password && (
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 2, mb: 2, backgroundColor: "#fafafa" }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Password must contain:
                                        </Typography>
                                        {passwordRequirements.map((req, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    mt: 0.5,
                                                }}
                                            >
                                                {req.met ? (
                                                    <CheckCircle sx={{ color: "green", fontSize: 18 }} />
                                                ) : (
                                                    <Cancel sx={{ color: "grey.400", fontSize: 18 }} />
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: req.met ? "green" : "text.secondary" }}
                                                >
                                                    {req.text}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Paper>
                                )}

                                {/* Confirm Password */}
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="disabled" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowConfirmPassword(!showConfirmPassword)
                                                    }
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? (
                                                        <VisibilityOff />
                                                    ) : (
                                                        <Visibility />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Password Match Feedback */}
                                {confirmPassword && !passwordsMatch && (
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                                    >
                                        <Cancel sx={{ fontSize: 18, mr: 0.5 }} /> Passwords do not
                                        match
                                    </Typography>
                                )}
                                {confirmPassword && passwordsMatch && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "green",
                                            display: "flex",
                                            alignItems: "center",
                                            mt: 0.5,
                                        }}
                                    >
                                        <CheckCircle sx={{ fontSize: 18, mr: 0.5 }} /> Passwords
                                        match
                                    </Typography>
                                )}

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        bgcolor: "orange.main",
                                        "&:hover": { bgcolor: "orange.dark" },
                                        textTransform: "none",
                                    }}
                                    disabled={!canSubmit}
                                >
                                    Reset Password
                                </Button>

                                <Typography
                                    variant="body2"
                                    align="center"
                                    color="text.secondary"
                                >
                                    Remember your password?{" "}
                                    <Link href="#" underline="hover" sx={{ color: "orange.main" }}>
                                        Sign in
                                    </Link>
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Paper
                            sx={{
                                p: 4,
                                textAlign: "center",
                                border: "2px solid",
                                borderColor: "orange.main",
                                bgcolor: "orange.50",
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: "orange.main",
                                    color: "white",
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    mx: "auto",
                                    mb: 2,
                                }}
                            >
                                <CheckCircle sx={{ fontSize: 36 }} />
                            </Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Password Reset Successful!
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Your password has been successfully reset. You can now sign in
                                with your new password.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: "orange.main",
                                    "&:hover": { bgcolor: "orange.dark" },
                                }}
                                onClick={() => (window.location.href = "#")}
                            >
                                Go to Sign In
                            </Button>
                        </Paper>
                    )}

                    <Divider sx={{ my: 4 }} />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 2 }}
                    >
                        Need help? Contact our{" "}
                        <Link href="#" underline="hover" sx={{ color: "orange.main" }}>
                            support team
                        </Link>
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );
}