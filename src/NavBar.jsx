import { useState } from 'react'
import './App.css'
import feather from './assets/feather.svg'




function NavBar() {

  return (
    <>
    
  <nav className="bg-white border-gray-200 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-300">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-center mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
         
                <img src='src/assets/dlogo.png' width={30}></img>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Distill</span>
          </a>
    
        </div>
      </nav>

    </>
  )
}

export default NavBar
