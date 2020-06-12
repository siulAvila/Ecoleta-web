import React, { Suspense } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

const Home = React.lazy(() => import('./pages/home'));
const CreatePoint = React.lazy(() => import('./pages/createPoint'));

const Routes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback>
        <Route component={Home} path="/" exact />
        <Route component={CreatePoint} path="/create-point" />
      </Suspense>
    </BrowserRouter>
  );
};

export default Routes;
