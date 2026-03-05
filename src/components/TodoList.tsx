import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { Check, Trash2, Plus, Edit2, Folder, Calendar as CalendarIcon, X } from 'lucide-react';
import { Project, Todo } from '../types';

export const TodoList: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, todos, addTodo, updateTodo, toggleTodo, deleteTodo } = useAppContext();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Set initial selected project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProjectId(null);
    }
  }, [projects, selectedProjectId]);

  // Project Form State
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectStart, setProjectStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [projectEnd, setProjectEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [projectColor, setProjectColor] = useState('#4f46e5');

  // Todo Form State
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [todoText, setTodoText] = useState('');
  const [todoDate, setTodoDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectStart || !projectEnd) return;
    
    if (editingProjectId) {
      updateProject(editingProjectId, {
        name: projectName,
        startDate: projectStart,
        endDate: projectEnd,
        color: projectColor
      });
    } else {
      addProject({
        name: projectName,
        startDate: projectStart,
        endDate: projectEnd,
        color: projectColor
      });
    }
    
    cancelProjectEdit();
  };

  const editProject = (p: Project) => {
    setIsEditingProject(true);
    setEditingProjectId(p.id);
    setProjectName(p.name);
    setProjectStart(p.startDate);
    setProjectEnd(p.endDate);
    setProjectColor(p.color);
  };

  const cancelProjectEdit = () => {
    setIsEditingProject(false);
    setEditingProjectId(null);
    setProjectName('');
    setProjectStart(format(new Date(), 'yyyy-MM-dd'));
    setProjectEnd(format(new Date(), 'yyyy-MM-dd'));
    setProjectColor('#4f46e5');
  };

  const handleTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim() || !todoDate || !selectedProjectId) return;
    
    if (editingTodoId) {
      updateTodo(editingTodoId, {
        text: todoText,
        date: todoDate,
        projectId: selectedProjectId
      });
      setEditingTodoId(null);
    } else {
      addTodo({
        text: todoText,
        date: todoDate,
        projectId: selectedProjectId
      });
    }
    
    setTodoText('');
  };

  const editTodo = (t: Todo) => {
    setEditingTodoId(t.id);
    setTodoText(t.text);
    setTodoDate(t.date);
  };

  const cancelTodoEdit = () => {
    setEditingTodoId(null);
    setTodoText('');
    setTodoDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTodos = todos.filter(t => t.projectId === selectedProjectId);

  // Group todos by date
  const groupedTodos = projectTodos.reduce((acc, todo) => {
    if (!acc[todo.date]) acc[todo.date] = [];
    acc[todo.date].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  const sortedDates = Object.keys(groupedTodos).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="flex h-full">
      {/* Projects Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Folder size={18} />
            프로젝트
          </h3>
          <button 
            onClick={() => setIsEditingProject(true)}
            className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map(p => (
            <div 
              key={p.id}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedProjectId === p.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={() => setSelectedProjectId(p.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="truncate font-medium text-sm">{p.name}</span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); editProject(p); }} className="p-1 text-gray-400 hover:text-indigo-600">
                  <Edit2 size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="p-1 text-gray-400 hover:text-rose-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              프로젝트를 추가해주세요.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Project Form Modal */}
        {isEditingProject && (
          <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{editingProjectId ? '프로젝트 수정' : '새 프로젝트'}</h3>
                <button onClick={cancelProjectEdit} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleProjectSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
                  <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                    <input type="date" value={projectStart} onChange={e => setProjectStart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                    <input type="date" value={projectEnd} onChange={e => setProjectEnd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                  <input type="color" value={projectColor} onChange={e => setProjectColor(e.target.value)} className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={cancelProjectEdit} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">취소</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Todo Area */}
        {selectedProject ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                  <h2 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h2>
                </div>
                <p className="text-gray-500 flex items-center gap-2">
                  <CalendarIcon size={16} />
                  {selectedProject.startDate} ~ {selectedProject.endDate}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">{editingTodoId ? '할 일 수정' : '할 일 추가'}</h3>
                  {editingTodoId && (
                    <button onClick={cancelTodoEdit} className="text-gray-400 hover:text-gray-600 p-1">
                      <X size={20} />
                    </button>
                  )}
                </div>
                <form onSubmit={handleTodoSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="date" 
                    value={todoDate} 
                    onChange={e => setTodoDate(e.target.value)} 
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    required 
                  />
                  <input 
                    type="text" 
                    value={todoText} 
                    onChange={e => setTodoText(e.target.value)} 
                    placeholder="해야 할 일을 입력하세요" 
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    required 
                  />
                  <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                    {editingTodoId ? <Edit2 size={20} /> : <Plus size={20} />}
                    {editingTodoId ? '수정' : '추가'}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                {sortedDates.map(dateStr => (
                  <div key={dateStr} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">{dateStr}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {groupedTodos[dateStr].map(todo => (
                        <div key={todo.id} className={`p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors ${editingTodoId === todo.id ? 'bg-indigo-50/50' : ''}`}>
                          <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTodo(todo.id)}>
                            <button 
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                todo.completed 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-gray-300 text-transparent hover:border-emerald-500'
                              }`}
                            >
                              <Check size={14} />
                            </button>
                            <span className={`text-lg transition-all ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {todo.text}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => editTodo(todo)} className="text-gray-400 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => deleteTodo(todo.id)} className="text-gray-400 hover:text-rose-500 p-2 rounded hover:bg-rose-50">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {projectTodos.length === 0 && (
                  <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                    이 프로젝트에 등록된 할 일이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {projects.length === 0 ? '프로젝트를 먼저 생성해주세요.' : '프로젝트를 선택해주세요.'}
          </div>
        )}
      </div>
    </div>
  );
};
