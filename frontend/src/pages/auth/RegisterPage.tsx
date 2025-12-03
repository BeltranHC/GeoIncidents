import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } catch (err) {
      // Error manejado en el store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-600 mt-2">
              Únete a la comunidad de reportes ciudadanos
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                {...register('firstName', { required: 'Nombre requerido' })}
                error={errors.firstName?.message}
                leftIcon={<User className="w-5 h-5" />}
                placeholder="Juan"
              />
              <Input
                label="Apellido"
                {...register('lastName', { required: 'Apellido requerido' })}
                error={errors.lastName?.message}
                placeholder="Pérez"
              />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              {...register('email', {
                required: 'El correo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Correo inválido',
                },
              })}
              error={errors.email?.message}
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="tu@email.com"
            />

            <Input
              label="Teléfono (opcional)"
              type="tel"
              {...register('phone')}
              leftIcon={<Phone className="w-5 h-5" />}
              placeholder="+51 999 999 999"
            />

            <Input
              label="Contraseña"
              type="password"
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 8,
                  message: 'Mínimo 8 caracteres',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Debe contener mayúscula, minúscula y número',
                },
              })}
              error={errors.password?.message}
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (value) =>
                  value === password || 'Las contraseñas no coinciden',
              })}
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Crear cuenta
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
