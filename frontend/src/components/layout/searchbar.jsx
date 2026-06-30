import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar';

const Searchbar = () => {
  return (
    <div>
        <Sidebar/>
        <Outlet/>
    </div>
  )
}

export default Searchbar
