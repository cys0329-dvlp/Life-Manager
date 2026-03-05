import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Todo, Project } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  projects: Project[];
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, p: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;

  todos: Todo[];
  addTodo: (t: Omit<Todo, 'id' | 'completed'>) => void;
  updateTodo: (id: string, t: Omit<Todo, 'id' | 'completed'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setTransactions([...transactions, { ...t, id: uuidv4() }]);
  };

  const updateTransaction = (id: string, t: Omit<Transaction, 'id'>) => {
    setTransactions(transactions.map(tr => tr.id === id ? { ...tr, ...t } : tr));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addProject = (p: Omit<Project, 'id'>) => {
    setProjects([...projects, { ...p, id: uuidv4() }]);
  };

  const updateProject = (id: string, p: Omit<Project, 'id'>) => {
    setProjects(projects.map(pr => pr.id === id ? { ...pr, ...p } : pr));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setTodos(todos.filter(t => t.projectId !== id));
  };

  const addTodo = (t: Omit<Todo, 'id' | 'completed'>) => {
    setTodos([...todos, { ...t, id: uuidv4(), completed: false }]);
  };

  const updateTodo = (id: string, t: Omit<Todo, 'id' | 'completed'>) => {
    setTodos(todos.map(td => td.id === id ? { ...td, ...t } : td));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      transactions, addTransaction, updateTransaction, deleteTransaction, 
      projects, addProject, updateProject, deleteProject,
      todos, addTodo, updateTodo, toggleTodo, deleteTodo 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
