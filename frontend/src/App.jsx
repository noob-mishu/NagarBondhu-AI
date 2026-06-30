import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Searchbar from './components/layout/searchbar';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
       

       <Route element={<Searchbar/>}>
       <Route path='/dashboard' element={<UserDashboard/>}/>



       </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
