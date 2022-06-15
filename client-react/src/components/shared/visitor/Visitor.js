
import { useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, CssBaseline, Box } from '@mui/material';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';

export default function Visitor() {
  const [crumbs, setCrumbs] = useState();

  return (
    <>
      <CssBaseline />
      <Header />
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex' }}>
          <Box component="main" sx={{ mt: 4, width: '100%' }}>
            <Breadcrumbs breadcrumbs={crumbs} />
            <Container maxWidth={false} disableGutters sx={{ minHeight: '100vh' }}>
              <Outlet context={[crumbs, setCrumbs]} />
            </Container>
            <Footer />
          </Box>
        </Box>
      </Container>
    </>
  );
}