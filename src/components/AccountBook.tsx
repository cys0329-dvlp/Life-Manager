import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Edit2, Trash2, X } from 'lucide-react';

export const AccountBook: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppContext();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    
    if (editingId) {
      updateTransaction(editingId, {
        type,
        amount: Number(amount),
        category,
        date,
        description
      });
      setEditingId(null);
    } else {
      addTransaction({
        type,
        amount: Number(amount),
        category,
        date,
        description
      });
    }
    
    setAmount('');
    setDescription('');
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setType(t.type);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setDate(t.date);
    setDescription(t.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">가계부</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">총 수입</p>
              <p className="text-2xl font-bold text-emerald-600">+{totalIncome.toLocaleString()}원</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">총 지출</p>
              <p className="text-2xl font-bold text-rose-600">-{totalExpense.toLocaleString()}원</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">잔액</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                {balance.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">최근 내역</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                <div key={t.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${editingId === t.id ? 'bg-indigo-50/50' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.category}</p>
                      <p className="text-sm text-gray-500">{t.date} {t.description && `· ${t.description}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}원
                    </span>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-rose-500 p-2 rounded hover:bg-rose-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-500">내역이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Add Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? '내역 수정' : '내역 추가'}
              </h3>
              {editingId && (
                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  지출
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  수입
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder={type === 'expense' ? "식비, 교통비 등" : "월급, 용돈 등"} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="상세 내용" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
              </div>
              
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                {editingId ? '수정하기' : '저장하기'}
              </button>
            </form>
          </div>

          {/* Chart */}
          {pieData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">지출 통계</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
