export interface User {
  id: number;
  email: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  is_active: boolean;
  profile_picture: string;
  password_change_required: boolean;
  date_joined: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: { access: string; refresh: string };
  user: User;
  password_change_required: boolean;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordResetRequest {
  token: string;
  new_password: string;
}
