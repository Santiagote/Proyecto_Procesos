export interface Schedule {
  id: number;
  subject: number;
  subject_name: string;
  teacher: number;
  teacher_name: string;
  week_day: number;
  start_time: string;
  end_time: string;
  classroom: string;
  academic_period: string;
  is_active: boolean;
}

export interface AcademicPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const WEEK_DAYS: { [key: number]: string } = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};
