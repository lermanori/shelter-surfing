import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';

const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password'),
  locationInput: yup.string().required('Location is required'),
  role: yup.string().oneOf(['HOST', 'SEEKER'], 'Please select a valid role').required('Role is required'),
}).required();

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: 'SEEKER'
    }
  });

  const selectedRole = watch('role');

  const handleRegister = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      await register(data);
      navigate('/dashboard');
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
          Join Shelter Surfing
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account to get started
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
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

          <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
            <InputField
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              {...registerField('name')}
              error={errors.name?.message}
              disabled={isLoading}
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              {...registerField('email')}
              error={errors.email?.message}
              disabled={isLoading}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              {...registerField('password')}
              error={errors.password?.message}
              disabled={isLoading}
            />
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...registerField('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />
            <InputField
              label="Location"
              name="locationInput"
              type="text"
              placeholder="Enter your city, state, or area"
              {...registerField('locationInput')}
              error={errors.locationInput?.message}
              disabled={isLoading}
            />
            <SelectField
              label="Account Type"
              name="role"
              value={watch('role')}
              onChange={e => setValue('role', e.target.value)}
              options={[
                { value: 'SEEKER', label: 'Seeker (I need shelter)' },
                { value: 'HOST', label: 'Host (I can offer shelter)' }
              ]}
              error={errors.role?.message}
              disabled={isLoading}
              required
            />
            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              variant="primary"
            >
              Create Account
            </Button>
          </form>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 