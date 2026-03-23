import React, { useMemo, useRef } from 'react';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { getMonthDateRange, getDaysInMonth } from '../utils/dateUtils';
import { PRIORITY_GANTT_COLOR } from '../utils/priorityUtils';
import { getUserById } from '../data/users';

const DAY_WIDTH = 36;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 200;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function dateToDay(dateStr: string, monthStart: Date): number {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const diff = Math.floor((date.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export const TimelineView: React.FC = () => {
  const tasks = useFilteredTasks();
  const { start: monthStart, year, month } = getMonthDateRange();
  const totalDays = getDaysInMonth(year, month);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = Math.floor((today.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const totalWidth = totalDays * DAY_WIDTH;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      const start = task.startDate ? new Date(task.startDate) : null;
      if (start) start.setHours(0, 0, 0, 0);

      const dueDayNum = dateToDay(task.dueDate, monthStart);
      const startDayNum = start ? dateToDay(task.startDate!, monthStart) : dueDayNum;

      return dueDayNum >= 0 || startDayNum < totalDays;
    });
  }, [tasks, monthStart, totalDays]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <h3 className="text-sm font-semibold text-slate-700">
          {MONTH_NAMES[month]} {year}
        </h3>
        <span className="text-xs text-slate-400">{filteredTasks.length} tasks</span>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{ display: 'flex', minWidth: LABEL_WIDTH + totalWidth + 1 }}>
          <div style={{ width: LABEL_WIDTH, flexShrink: 0, position: 'sticky', left: 0, zIndex: 10, background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', paddingLeft: 12, borderBottom: '1px solid #e2e8f0' }}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Task</span>
            </div>
            {filteredTasks.map((task, i) => {
              const user = getUserById(task.assigneeId);
              return (
                <div
                  key={task.id}
                  style={{
                    height: ROW_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 12,
                    paddingRight: 8,
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 0 ? '#f8fafc' : '#fff',
                    gap: 6,
                  }}
                >
                  {user && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: user.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <span style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ height: 40, display: 'flex', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 5, background: '#f8fafc' }}>
              {Array.from({ length: totalDays }, (_, i) => {
                const date = new Date(monthStart);
                date.setDate(date.getDate() + i);
                const isToday = i === todayDay;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={i}
                    style={{
                      width: DAY_WIDTH,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #f1f5f9',
                      background: isToday ? '#eef2ff' : isWeekend ? '#f8fafc' : 'transparent',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 9, color: isToday ? '#6366f1' : '#94a3b8', fontWeight: isToday ? 700 : 400 }}>
                      {['S','M','T','W','T','F','S'][date.getDay()]}
                    </span>
                    <span style={{ fontSize: 11, color: isToday ? '#6366f1' : '#64748b', fontWeight: isToday ? 700 : 500 }}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ position: 'relative' }}>
              {filteredTasks.map((task, i) => {
                const dueDayNum = dateToDay(task.dueDate, monthStart);
                const startDayNum = task.startDate ? dateToDay(task.startDate, monthStart) : null;
                const isWeekend = (day: number) => {
                  const d = new Date(monthStart);
                  d.setDate(d.getDate() + day);
                  return d.getDay() === 0 || d.getDay() === 6;
                };

                const color = PRIORITY_GANTT_COLOR[task.priority];
                const hasRange = startDayNum !== null && startDayNum !== dueDayNum;

                const barStart = hasRange
                  ? clamp(startDayNum!, 0, totalDays - 1)
                  : clamp(dueDayNum, 0, totalDays - 1);
                const barEnd = hasRange
                  ? clamp(dueDayNum, 0, totalDays - 1)
                  : clamp(dueDayNum, 0, totalDays - 1);

                const barLeft = barStart * DAY_WIDTH;
                const barWidth = hasRange
                  ? Math.max(DAY_WIDTH, (barEnd - barStart + 1) * DAY_WIDTH)
                  : DAY_WIDTH;

                const isOutOfView = barEnd < 0 || barStart >= totalDays;

                return (
                  <div
                    key={task.id}
                    style={{
                      height: ROW_HEIGHT,
                      position: 'relative',
                      borderBottom: '1px solid #f1f5f9',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                      width: totalDays * DAY_WIDTH,
                    }}
                  >
                    {Array.from({ length: totalDays }, (_, d) => (
                      isWeekend(d) && (
                        <div
                          key={d}
                          style={{
                            position: 'absolute',
                            left: d * DAY_WIDTH,
                            top: 0,
                            width: DAY_WIDTH,
                            height: '100%',
                            background: 'rgba(241,245,249,0.7)',
                            pointerEvents: 'none',
                          }}
                        />
                      )
                    ))}
                    {!isOutOfView && (
                      <div
                        title={`${task.title} — ${task.startDate ?? task.dueDate} to ${task.dueDate}`}
                        style={{
                          position: 'absolute',
                          left: barLeft,
                          width: barWidth,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: hasRange ? 20 : 12,
                          background: hasRange ? color : 'transparent',
                          border: hasRange ? `2px solid ${color}` : 'none',
                          borderRadius: hasRange ? 4 : 0,
                          opacity: 0.85,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: hasRange ? '0 6px' : 0,
                        }}
                      >
                        {!hasRange && (
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: color,
                              border: `2px solid ${color}`,
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        )}
                        {hasRange && barWidth > 60 && (
                          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {task.title}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {todayDay >= 0 && todayDay < totalDays && (
              <div
                style={{
                  position: 'absolute',
                  left: todayDay * DAY_WIDTH + DAY_WIDTH / 2,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: '#6366f1',
                  opacity: 0.7,
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#6366f1',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 4px',
                    borderRadius: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Today
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="10" width="36" height="30" rx="4" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M15 6v8M33 6v8M6 22h36" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-slate-400 text-sm">No tasks in timeline</p>
          </div>
        )}
      </div>
    </div>
  );
};
