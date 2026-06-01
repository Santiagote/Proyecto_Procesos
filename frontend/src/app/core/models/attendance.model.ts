export interface AttendanceRecord {
  id: number;
  student: number;
  student_name: string;
  student_cedula: string;
  schedule: number;
  subject: number;
  subject_name: string;
  teacher: number;
  teacher_name: string;
  status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED';
  recorded_at: string;
  confidence: number;
  ip_address: string;
}

export interface AttendanceCaptureResponse {
  detail: string;
  attendance: AttendanceRecord;
}

export interface AttendanceException {
  id: number;
  attendance_record: number;
  student: number;
  student_name: string;
  schedule: number;
  previous_status: string;
  new_status: string;
  reason: string;
  supporting_document: string;
  modified_by: number;
  modified_by_name: string;
  created_at: string;
}

export interface AttendanceSummary {
  subject_id: number;
  total_sessions: number;
  enrolled_students: number;
  students: StudentSummary[];
}

export interface StudentSummary {
  student_id: number;
  student_name: string;
  cedula: string;
  total_sessions: number;
  present: number;
  absent: number;
  justified: number;
  percentage: number;
}
