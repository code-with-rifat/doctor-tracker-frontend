export type Admin = {
  id: string;
  name: string;
  email: string;
};

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
};

export type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  condition: string;
  doctor: Doctor | string;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  pagination: Pagination;
};

export type DashboardStats = {
  cards: {
    totalDoctors: number;
    totalPatients: number;
    patientsThisMonth: number;
    averagePatientsPerDoctor: number;
  };
  charts: {
    patientsPerDoctor: { doctorId: string; name: string; count: number }[];
    patientsLast30Days: { date: string; count: number }[];
    patientsLast12Months: { month: string; count: number }[];
    patientsByCondition: { condition: string; count: number }[];
    topSpecializations: { specialization: string; count: number }[];
  };
};

export type ApiError = {
  message: string;
  errors?: { field: string; message: string }[];
};
