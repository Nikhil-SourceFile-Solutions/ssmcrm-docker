const routes = [
    { path: '/dashboard', component: Dashboard, allowed: ['admin', 'manager'] },
    { path: '/profile', component: Profile, allowed: ['admin', 'user', 'manager'] },
    { path: '/admin-panel', component: AdminPanel, allowed: ['admin'] }
  ];

  const ProtectedRoute = ({ component: Component, allowed, ...rest }) => {
    const userType = getUserType(); // Fetch user type from context or store

    return (
      <Route
        {...rest}
        render={(props) =>
          allowed.includes(userType) ? <Component {...props} /> : <Redirect to="/not-authorized" />
        }
      />
    );
  };

  const AppRoutes = () => (
    <Switch>
      {routes.map((route, index) => (
        <ProtectedRoute
          key={index}
          path={route.path}
          component={route.component}
          allowed={route.allowed}
        />
      ))}
    </Switch>
  );
