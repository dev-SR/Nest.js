import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';

const PrivateRoute: React.FC<RouteProps> = ({ ...routeProps }) => {
  const { isLogged } = useAuth();
  if (isLogged) {
    return <Route {...routeProps} />;
  } else {
    return (
      <Redirect
        to={{
          pathname: '/login',
        }}
      />
    );
  }
};

export default PrivateRoute;
