import { useState } from 'react'
import LoginForm from './LoginForm'
import SignUp from './SignUp';
function Hero() {
const [showLoginPopup, setShowLoginPopup] = useState(false);
const [showSignupPopup, setShowSignupPopup] = useState(false); 


const handleLoginClick = (e) => {
  e.preventDefault();
  setShowLoginPopup(true);
};


const handleSignupClick = (e) => {
  e.preventDefault();
  setShowSignupPopup(true);
};

const handleClosePopup = () => {
  setShowLoginPopup(false);
  setShowSignupPopup(false); 
};

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    setShowLoginPopup(false);
    setShowSignupPopup(false); 
  }
};


  return (
    <>
<section class="bg-white dark:bg-gray-900 mt-10">
    <div class= " mx-auto max-w-screen-xl text-center  lg:px-12">
       
        <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-6xl lg:text-7xl dark:text-white">A better notes app<br /> </h1>
        <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
      
More than notes. Distill helps you learn smarter with AI.<br></br>
Capture, organize, and transform your ideas into lasting knowledge.
        </p>       

 <div class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
              <button
               onClick={handleSignupClick}
              class="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-neutral-950 px-6 font-medium text-neutral-200 transition hover:scale-110">
              <span>Sign up</span>
              <div class="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div class="relative h-full w-8 bg-white/20"></div></div></button>
{/* <button 
  onClick={handleSignupClick}
class="text-white bg-black hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800">
  Signup
</button> */}
            {/* <button 
            onClick={handleLoginClick}
            class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-red-800 hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            >
            Login
            </button>  */}

            <button 
             onClick={handleLoginClick}
              class="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white border border-gray-800   px-6 font-medium text-black transition hover:scale-110">
              <span>Login</span><div class="absolute inset-0 h-full w-0 bg-red/50 transition-[width] group-hover:w-full"></div></button>


        </div>

        
  
    </div>

{showLoginPopup && (
  <div 
    className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-4"
    onClick={handleOverlayClick}
  >
    <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 max-w-md w-full">
  
      <button
        onClick={handleClosePopup}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <LoginForm />
    </div>
  </div>
)}


{showSignupPopup && (
  <div 
    className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-4"
    onClick={handleOverlayClick}
  >
    <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 max-w-md w-full">

      <button
        onClick={handleClosePopup}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <SignUp />
    </div>
  </div>
)}

</section>

<div className="flex justify-center items-center mt-8">


<img
src='src/assets/preview.png'
className='border-gray drop-shadow-lg mb-10'
width={700} 
/>
</div>


    </>
  )
}

export default Hero
