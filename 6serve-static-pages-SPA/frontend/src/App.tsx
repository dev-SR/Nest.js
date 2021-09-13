import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AuthProvider from './context/AuthProvider';
import ThemeProvider from './context/ThemeProvider';
import PrivateRoute from './helpers/PrivateRoutes';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Switch>
            <PrivateRoute path="/" exact component={() => <Home />}></PrivateRoute>
            <Route path="/login" exact component={() => <div>Login</div>}></Route>
            <Route path="*" exact component={() => <div>NOT FOUND</div>}></Route>
          </Switch>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
