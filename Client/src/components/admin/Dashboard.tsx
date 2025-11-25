import { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography } from '@mui/material';
import { Shield } from 'lucide-react';
import UsersManagement from './UsersManagement';
import PostsManagement from './PostsManagement';
import ReportsManagement from './ReportsManagement';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000' }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #27272a', bgcolor: '#000' }}>
        <Container sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: '#ea580c'
            }}>
              <Shield size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                Manage your website content
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container sx={{ py: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          sx={{
            mb: 4,
            borderBottom: '1px solid #27272a',
            '& .MuiTabs-indicator': {
              bgcolor: '#ea580c',
              height: 2
            }
          }}
        >
          <Tab
            label="Users Management"
            sx={{
              color: '#a1a1aa',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              '&.Mui-selected': {
                color: '#ea580c'
              }
            }}
          />
          <Tab
            label="Posts Management"
            sx={{
              color: '#a1a1aa',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              '&.Mui-selected': {
                color: '#ea580c'
              }
            }}
          />
          <Tab
            label="Reports Management"
            sx={{
              color: '#a1a1aa',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              '&.Mui-selected': {
                color: '#ea580c'
              }
            }}
          />
        </Tabs>

        {activeTab === 0 && <UsersManagement />}
        {activeTab === 1 && <PostsManagement />}
        {activeTab === 2 && <ReportsManagement />}
      </Container>
    </Box>
  );
}