import { User } from '../models';
import { generateToken, generateRefreshToken } from '../utils';
import { UserRole } from '../types/enums';
import { AppError } from '../middlewares';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email: data.email } });
    
    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado', 400);
    }

    // Crear usuario
    const user = await User.create({
      ...data,
      role: UserRole.CITIZEN,
      isActive: true,
      isAnonymous: false,
    });

    // Generar tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    // Actualizar último login
    await user.update({ lastLogin: new Date() });

    return {
      user: user.toPublicJSON() as any,
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Buscar usuario
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new AppError('Usuario desactivado. Contacte al administrador', 401);
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(data.password);

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    // Actualizar último login
    await user.update({ lastLogin: new Date() });

    return {
      user: user.toPublicJSON() as any,
      token,
      refreshToken,
    };
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user.toPublicJSON() as any;
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'isAnonymous'>>
  ): Promise<Omit<User, 'password'>> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await user.update(data);

    return user.toPublicJSON() as any;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isValidPassword = await user.comparePassword(currentPassword);

    if (!isValidPassword) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    await user.update({ password: newPassword });
  }
}

export default new AuthService();
