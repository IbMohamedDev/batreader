import { useState } from 'react'
import { useAuthStore } from '../store/auth.js'
import './App.css'
import logo from '../src/assets/dlogo.png'


function LoginForm({ onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { signin, isLoading, error, clearError } = useAuthStore()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await signin(formData.email, formData.password)

    if (result.success) {
      if (onClose) {
        onClose()
      }
      console.log('Logged in')
    }
  }

  return (
    <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                       <div className="flex items-center space-x-2">
           <img src={logo} alt="logo" className="h-6 w-6" />
         
           <h3 className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
             Sign in to your account
           </h3>
         
         </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input 
              type="email" 
              name="email" 
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              placeholder="name@company.com" 
              required 
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input 
              type="password" 
              name="password" 
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••" 
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              required 
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full text-white group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-neutral-950 px-6 font-medium text-neutral-200"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm