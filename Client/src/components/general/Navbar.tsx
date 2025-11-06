import React from 'react'
import { AppBar, Toolbar, Box, Button, Link } from '@mui/material';

function Navbar() {
  return (
    <div>
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 2, justifyContent: 'space-between' }}>

          {/* Left side: Logo */}
          <Box component="img" src="/logo-white-new-caption.png" alt="Odyssey Logo" sx={{ height: { xs: 90, md: 110 }, objectFit: 'contain' }} />

          {/* Right side: Links + Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 3 }}>
              <Link href="#features" underline="none" sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}>Features</Link>
              <Link href="#about" underline="none" sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}>About</Link>
            </Box>
            <Button variant="text" sx={{ color: 'white', mr: 1, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>Log In</Button>
            <Button variant="contained" sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, fontWeight: 600 }}>Sign Up</Button>
          </Box>

        </Toolbar>
      </AppBar>

 
    </div>
  )
}

export default Navbar
