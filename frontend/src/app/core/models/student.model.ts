export interface Career {
  id: number;
  name: string;
  code: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  career: number;
  career_name?: string;
  teachers: number[];
}

export interface Student {
  id: number;
  user: {
    id: number;
    email: string;
    cedula: string;
    nombres: string;
    apellidos: string;
    telefono: string;
  };
  career: number;
  career_name: string;
  nivel: number;
  reference_image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentCreateRequest {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  career_id: number;
  nivel: number;
  reference_image?: File;
}

export interface StudentSubject {
  id: number;
  student: number;
  subject: number;
  subject_name: string;
  subject_code: string;
  academic_period: string;
}
