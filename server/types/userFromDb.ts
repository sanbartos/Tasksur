export interface UserFromDb {
  id: string;
  email: string | null;
  password: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: string | null;
  hourlyRate?: string | null;
  totalEarnings?: string | null;
  totalTasks?: number | null;
  rating?: string | null;
  reviewCount?: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  isTasker?: boolean | null;  // <-- Esta es la línea que debes agregar
}