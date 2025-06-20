import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import Button from '../components/Button';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to the page they were trying to access, or dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const handleLogin = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your Shelter Surfing account
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            {/* Email */}
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              error={errors.email?.message}
              autoComplete="email"
              disabled={isLoading}
            />
            {/* Password */}
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
              autoComplete="current-password"
              disabled={isLoading}
            />
            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              variant="primary"
            >
              Sign in
            </Button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Account</span>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                Try signing in with these demo credentials:
              </p>
              <div className="text-xs font-mono text-gray-700 space-y-1">
                <div><strong>Email:</strong> demo@example.com</div>
                <div><strong>Password:</strong> password123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 