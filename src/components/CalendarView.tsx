import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions, todos, projects } = useAppContext();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const startDayOfWeek = monthStart.getDay();
  const paddedStartDate = new Date(monthStart);
  paddedStartDate.setDate(monthStart.getDate() - startDayOfWeek);
  
  const endDayOfWeek = monthEnd.getDay();
  const paddedEndDate = new Date(monthEnd);
  paddedEndDate.setDate(monthEnd.getDate() + (6 - endDayOfWeek));

  const days = eachDayOfInterval({ start: paddedStartDate, end: paddedEndDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{format(currentDate, 'yyyy년 MM월')}</h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden flex-1">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTransactions = transactions.filter(t => t.date === dateStr);
          const dayTodos = todos.filter(t => t.date === dateStr);
          
          // Find projects that are active on this day
          const activeProjects = projects.filter(p => {
            try {
              const start = parseISO(p.startDate);
              const end = parseISO(p.endDate);
              // Set time to midnight for accurate comparison
              start.setHours(0,0,0,0);
              end.setHours(23,59,59,999);
              return isWithinInterval(day, { start, end });
            } catch (e) {
              return false;
            }
          });
          
          const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

          return (
            <div 
              key={day.toString()} 
              className={`bg-white p-2 min-h-[120px] flex flex-col ${!isSameMonth(day, currentDate) ? 'opacity-50 bg-gray-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                {/* Projects Bar */}
                {activeProjects.map(p => (
                  <div key={`proj-${p.id}`} className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded truncate" style={{ backgroundColor: p.color }}>
                    {p.name}
                  </div>
                ))}

                {/* Transactions */}
                {income > 0 && (
                  <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded truncate">
                    +{income.toLocaleString()}
                  </div>
                )}
                {expense > 0 && (
                  <div className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded truncate">
                    -{expense.toLocaleString()}
                  </div>
                )}

                {/* Todos */}
                {dayTodos.map(todo => {
                  const project = projects.find(p => p.id === todo.projectId);
                  return (
                    <div key={todo.id} className={`text-xs truncate px-1.5 py-0.5 rounded flex items-center gap-1 ${todo.completed ? 'line-through text-gray-400 bg-gray-50' : 'bg-gray-100 text-gray-800'}`}>
                      {project && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />}
                      <span className="truncate">{todo.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
