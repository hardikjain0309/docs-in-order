import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router';
import WorkspaceList from './workspace-list/WorkspaceList';
import Drawer from '@mui/material/Drawer';
import { useAppSelector } from './store/hooks';
import { useColorScheme } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const drawerWidth = 300;
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  flexGrow: 1,
  transition: theme.transitions.create('padding', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  paddingLeft: `0`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('padding', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        paddingLeft: `${drawerWidth}px`,
      },
    },
  ],
}));

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { workspaceFetchStatus, workspaces } = useAppSelector(
    (state) => state.workspace,
  );

  const showSideNav = useMemo(() => {
    return workspaceFetchStatus === 'success' && workspaces.length > 0;
  }, [workspaceFetchStatus, workspaces.length]);

  const theme = useTheme();

  const { mode, setMode } = useColorScheme();

  const toggleColorMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (showSideNav) {
      setTimeout(() => setIsSidebarOpen(true));
    }
  }, [showSideNav])

  return (
    
      <Box 
        sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "background.default",
        color: "text.primary",
        }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            { showSideNav && <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MenuIcon />
            </IconButton> }
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Docs in Order
            </Typography>
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          anchor="left"
          open={isSidebarOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
          >
          <Toolbar />
          <WorkspaceList /> 
        </Drawer>
        <Main open={isSidebarOpen}>
          <Toolbar />
          <Box sx={{
            position: "relative",
            flexGrow: 1,
            height: "100%",
            width: "100%",
            overflow: "auto"
          }}>
          <Outlet />
          </Box>
        </Main>
      </Box>
  );
}

export default HomePage;