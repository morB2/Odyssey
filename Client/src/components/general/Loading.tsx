import { Backpack, Car, Tent, Camera } from 'lucide-react';
import { Box, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const icons = [Backpack, Car, Tent, Camera];

interface JourneyLoaderProps {
  size?: number;
}

export default function JourneyLoader({ size = 80 }: JourneyLoaderProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const Icon = icons[currentIconIndex];

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="svg"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: 'rotate(-90deg)',
        }}
      >
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#fed7aa"
          strokeWidth="3"
          opacity="0.3"
        />

        {/* Animated dashed circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="3"
          strokeDasharray="8,8"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -circumference] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Animated dots around the circle */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r="4"
            fill="#f97316"
            stroke="white"
            strokeWidth="2"
            animate={{
              cx: [
                center + radius * Math.cos((i * 2 * Math.PI) / 3),
                center + radius * Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI),
              ],
              cy: [
                center + radius * Math.sin((i * 2 * Math.PI) / 3),
                center + radius * Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI),
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.2,
            }}
          />
        ))}
      </Box>

      {/* Center icon */}
      <motion.div
        key={currentIconIndex}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          position: 'absolute',
          backgroundColor: '#ffedd5',
          padding: 12,
          borderRadius: '50%',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={24} color="#ea580c" />
        </motion.div>
      </motion.div>
    </Box>
  );
}