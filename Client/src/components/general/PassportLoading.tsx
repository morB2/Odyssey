import { motion } from "motion/react";
import { Box, Typography } from "@mui/material";

interface Stamp {
  id: number;
  icon: string;
  label: string;
  rotation: number;
  x: number;
  y: number;
}

const stamps: Stamp[] = [
  { id: 1, icon: "plane", label: "PARIS", rotation: -8, x: 10, y: 15 },
  { id: 2, icon: "palm", label: "BALI", rotation: 12, x: 52, y: 12 },
  { id: 3, icon: "mountain", label: "ALPS", rotation: -5, x: 15, y: 52 },
  { id: 4, icon: "city", label: "TOKYO", rotation: 8, x: 55, y: 55 },
];

const StampIcon = ({ type }: { type: string }) => {
  const strokeColor = "#000";
  switch (type) {
    case "plane":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      );
    case "palm":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
          <path d="M12 2c-1.5 4-4 6-7 7 3 1 5.5 3 7 7 1.5-4 4-6 7-7-3-1-5.5-3-7-7z" />
          <path d="M12 16v6" strokeLinecap="round" />
        </svg>
      );
    case "mountain":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
          <path d="M3 20h18L14 4l-4 6-4-2-3 12z" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M7 18l2-6 3 4 5-10" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "city":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
          <rect x="3" y="10" width="5" height="10" />
          <rect x="10" y="6" width="5" height="14" />
          <rect x="17" y="12" width="4" height="8" />
          <path d="M5 10V8M12 6V4M19 12V10" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export default  function PassportLoading() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="none"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Passport */}
        <Box position="relative" width={128} height={80}>
          {/* Left Page */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{
              duration: 4,
              times: [0, 0.15, 0.85, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "50%",
              border: "4px solid black",
              borderRightWidth: "2px",
              borderRadius: "4px 0 0 4px",
              backgroundColor: "white",
              transformOrigin: "right",
            }}
          >
            {/* Decorative lines */}
            <Box position="absolute" left={8} top={8} width={32} height={1} bgcolor="gray.300" />
            <Box position="absolute" left={8} top={16} width={24} height={1} bgcolor="gray.300" />
          </motion.div>

          {/* Right Page */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{
              duration: 4,
              times: [0, 0.15, 0.85, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "50%",
              border: "4px solid black",
              borderLeftWidth: "2px",
              borderRadius: "0 4px 4px 0",
              backgroundColor: "white",
              transformOrigin: "left",
              overflow: "hidden",
            }}
          >
            {/* Stamps */}
            {stamps.map((stamp, index) => (
              <motion.div
                key={stamp.id}
                initial={{ scale: 0, rotate: 0, opacity: 0 }}
                animate={{
                  scale: [0, 0, 1.15, 1, 1, 0],
                  rotate: [0, 0, stamp.rotation, stamp.rotation, stamp.rotation, 0],
                  opacity: [0, 0, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 4,
                  times: [0, 0.15 + index * 0.1, 0.15 + index * 0.1 + 0.1, 0.15 + index * 0.1 + 0.15, 0.75, 0.85],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  left: `${stamp.x}%`,
                  top: `${stamp.y}%`,
                  width: 20,
                  height: 18,
                }}
              >
                <Box
                  position="relative"
                  width="100%"
                  height="100%"
                  border="1px dashed black"
                  borderRadius={1}
                  bgcolor="white"
                  p={0.25}
                >
                  {/* Icon */}
                  <Box width={8} height={8} mx="auto">
                    <StampIcon type={stamp.icon} />
                  </Box>

                  {/* Label */}
                  <Typography
                    fontSize={4}
                    textAlign="center"
                    mt={0.5}
                    lineHeight={1}
                  >
                    {stamp.label}
                  </Typography>

                  {/* Orange postmark */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 0.7, 0.7, 0.7, 0] }}
                    transition={{
                      duration: 4,
                      times: [0, 0.15 + index * 0.1 + 0.05, 0.15 + index * 0.1 + 0.1, 0.75, 0.8, 0.85],
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      border: "1px solid orange",
                    }}
                  />
                </Box>
              </motion.div>
            ))}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
