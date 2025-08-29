import { useState } from 'react'
import { useAuthStore } from '../store/auth.js'
import './App.css'
import logo from '../src/assets/dlogo.png'


function SignUp({ onClose }) {
  console.log("signup starting")
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [success, setSuccess] = useState('')

  const { signup, isLoading, error, clearError } = useAuthStore()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) clearError()
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')

    const result = await signup(formData.email, formData.password)

    if (result.success) {
      if (result.requiresVerification) {
        setSuccess('Account created successfully! Please check your email to verify your account.')
        setTimeout(() => {
          if (onClose) onClose()
        }, 3000)
      } else {
        setSuccess('Account created and signed in successfully!')
        setTimeout(() => {
          if (onClose) onClose()
        }, 1500)
      }
    }
  }

  return (
    <>
      <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                 
              <div className="flex items-center space-x-2">
  <img src={logo} alt="logo" className="h-6 w-6" />

  <h3 className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
    Create new account
  </h3>

</div>

          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-800 bg-green-100 border border-green-300 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              {success}
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
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="••••••••" 
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                required 
                minLength={6}
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-white group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-neutral-950 px-6 font-medium text-neutral-200"
            >
              {/* <button class="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-neutral-950 px-6 font-medium text-neutral-200"><span>Hover me</span><div class="ml-1 transition group-hover:translate-x-1"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></div></button> */}
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default SignUp