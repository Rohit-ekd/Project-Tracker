import React, { useCallback } from 'react';
import { useStore } from './store/useStore';
import { Filters, ViewMode } from './types';
import { KanbanView } from './views/KanbanView';
import { ListView } from './views/ListView';
import { TimelineView } from './views/TimelineView';
import { FilterBar } from './components/FilterBar';
import { CollabAvatarsBar } from './components/CollabAvatars';
import { useCollabSimulation } from './hooks/useCollabSimulation';
import { useSyncUrlFilters } from './hooks/useUrlFilters';

function ViewToggle() {
  const view = useStore(s => s.view);
  const setView = useStore(s => s.setView);

  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'kanban',
      label: 'Kanban',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="4" height="12" rx="1" fill="currentColor" opacity="0.6"/>
          <rect x="5.5" y="1" width="3" height="12" rx="1" fill="currentColor"/>
          <rect x="9" y="1" width="4" height="12" rx="1" fill="currentColor" opacity="0.6"/>
        </svg>
      ),
    },
    {
      id: 'list',
      label: 'List',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor"/>
          <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor" opacity="0.6"/>
          <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor" opacity="0.6"/>
        </svg>
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="3" width="6" height="2" rx="1" fill="currentColor"/>
          <rect x="4" y="6" width="8" height="2" rx="1" fill="currentColor" opacity="0.6"/>
          <rect x="2" y="9" width="5" height="2" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        background: '#f1f5f9',
        padding: 3,
        borderRadius: 8,
        border: '1px solid #e2e8f0',
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: view === tab.id ? 600 : 400,
            color: view === tab.id ? '#1e293b' : '#64748b',
            background: view === tab.id ? '#fff' : 'transparent',
            boxShadow: view === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  const view = useStore(s => s.view);
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);
  const setView = useStore(s => s.setView);

  const handleInit = useCallback((f: Filters, v: ViewMode) => {
    setFilters(f);
    setView(v);
  }, [setFilters, setView]);

  useSyncUrlFilters(filters, view, handleInit);
  useCollabSimulation();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="14" rx="2" fill="white" opacity="0.9"/>
              <rect x="10" y="2" width="6" height="8" rx="2" fill="white" opacity="0.6"/>
              <rect x="10" y="12" width="6" height="4" rx="2" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1 }}>ProjectFlow</h1>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>500 tasks · All projects</p>
          </div>
        </div>
        <CollabAvatarsBar />
      </header>

      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          flexShrink: 0,
          background: '#fff',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <FilterBar />
        <ViewToggle />
      </div>

      <main
        style={{
          flex: 1,
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {view === 'kanban' && (
          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'auto' }}>
            <KanbanView />
          </div>
        )}
        {view === 'list' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ListView />
          </div>
        )}
        {view === 'timeline' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <TimelineView />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
