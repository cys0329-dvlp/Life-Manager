export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  color: string;
}

export interface Todo {
  id: string;
  projectId: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export type ViewMode = 'calendar' | 'account' | 'todo';
