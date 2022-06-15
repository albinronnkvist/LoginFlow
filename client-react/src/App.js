import './styles/main.css'
import ThemeConfig from './styles/ThemeConfig';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { CustomerAuthProvider } from './context/CustomerAuthProvider';
import Admin from './components/shared/admin/Admin';
import Visitor from './components/shared/visitor/Visitor';
import NotFound from './components/shared/NotFound'
import Unauthorized from './components/shared/Unauthorized'
import Home from './pages/visitor/Home';
import Register from './pages/admin/staff/Register';
import AdminLogin from './pages/admin/auth/AdminLogin';
import CustomerLogin from './pages/visitor/auth/CustomerLogin';
import Account from './pages/visitor/auth/Account';
import Staff from './pages/admin/staff/Staff';
import ForgotPassword from './pages/admin/auth/ForgotPassword';
import ResetPassword from './pages/admin/auth/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/customers/Customers';

// Roles that matches the roles from the API response
const ROLES = {
  'Admin': 'Administrator',
  'Manager': 'Manager',
  'Employee': 'Employee'
}

export default function App() {
  return (
    // ThemeConfig sets the current theme for the entire app.
    <ThemeConfig>
      {/* BrowserRouter is the router implementation for HTML5 browser */}
      <BrowserRouter>
        {/* 
          AuthProvider should be the parent component since 
          all components needs the auth context for the protected routes to work.
        */}
        <AuthProvider>
          <CustomerAuthProvider>
            <Routes>
              {/* Route is the conditionally shown component based on matching a path to a URL */}
              {/* VISITOR ROUTES*/}
              <Route path="/" element={<Visitor />}>
                <Route path="" element={<Home />} />
                <Route path="adminlogin" element={<AdminLogin />} />
                <Route path="customerlogin" element={<CustomerLogin />} />
                <Route path="account" element={<Account />} />
              </Route>
              

              {/* 
                AUTH ROUTES
                Some routes also require role authorization which is specified with the "allowedRoles" array.
              */}
              <Route path="/admin" element={<Admin allowedRoles={[ROLES.Admin, ROLES.Manager, ROLES.Employee]} />}>
                <Route path="" element={<Navigate replace to="dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="customers" element={<Customers />} />
              </Route>

              <Route path="/admin" element={<Admin allowedRoles={[ROLES.Admin, ROLES.Manager]} />}>
                <Route path="staff" element={<Staff />} />
                <Route path="staff/register" element={<Register />} />
              </Route>

              <Route path="/admin" element={<Admin allowedRoles={[ROLES.Admin]} />}>
              </Route>
              

              {/* OTHER ROUTES */}
              <Route path="/password/forgot" element={<ForgotPassword />} />
              <Route path="/password/reset" element={<ResetPassword />} />


              {/* ERROR ROUTES */}
              {/* 401 route, when an authenticated user is unauthorized */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              {/* 404 route, when the URL path doesn't match a route */}
              <Route path="*" element={<NotFound />} /> 
            </Routes>
          </CustomerAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeConfig>
  );
}