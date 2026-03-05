/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { AccountBook } from './components/AccountBook';
import { TodoList } from './components/TodoList';
import { ViewMode } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');

  return (
    <AppProvider>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />
        <main className="flex-1 overflow-hidden">
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'account' && <AccountBook />}
          {currentView === 'todo' && <TodoList />}
        </main>
      </div>
    </AppProvider>
  );
}
