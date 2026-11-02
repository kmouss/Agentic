import React, { useState } from 'react';
import { TimelineTask } from '../types.ts';
import { CalendarDays, Check, Plus, Clock, Sparkles } from 'lucide-react';

interface TimelineViewProps {
  tasks: TimelineTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TimelineTask, 'id' | 'completed'>) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimeframe, setNewTimeframe] = useState('1 Day Before');
  const [newTask, setNewTask] = useState('');
  const [newCategory, setNewCategory] = useState('Prep');

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Group tasks by timeframe
  const timeframes = ['3 Days Before', '1 Day Before', 'Day Of (Morning)', '1 Hour Before'];
  const groupedTasks: Record<string, TimelineTask[]> = {};

  timeframes.forEach((tf) => {
    groupedTasks[tf] = [];
  });

  tasks.forEach((task) => {
    if (!groupedTasks[task.timeframe]) {
      groupedTasks[task.timeframe] = [];
    }
    groupedTasks[task.timeframe].push(task);
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    onAddTask({
      timeframe: newTimeframe,
      task: newTask.trim(),
      category: newCategory,
    });

    setNewTask('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Party Preparation & Shopping Roadmap
            </h2>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            Spreading your shopping and prep across milestones prevents day-of panic. Complete tasks progressively so you can actually enjoy your own party.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right">
            <div className="text-xs font-semibold text-neutral-900 font-mono tabular-nums">
              {completedCount} / {tasks.length} Completed
            </div>
            <div className="w-28 bg-neutral-100 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Add Step Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200 text-xs"
        >
          <div className="font-bold text-neutral-900 text-sm">Add Prep Task</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-600 mb-1 font-medium">Timeframe</label>
              <select
                value={newTimeframe}
                onChange={(e) => setNewTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="3 Days Before">3 Days Before</option>
                <option value="1 Day Before">1 Day Before</option>
                <option value="Day Of (Morning)">Day Of (Morning)</option>
                <option value="1 Hour Before">1 Hour Before</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-600 mb-1 font-medium">Task Description</label>
              <input
                type="text"
                placeholder="e.g. Marinate chicken thighs, pick up 3 bags of ice"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-neutral-500 hover:text-neutral-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg"
            >
              Add Step
            </button>
          </div>
        </form>
      )}

      {/* Milestone Cards */}
      <div className="space-y-4">
        {timeframes.map((tf) => {
          const tfTasks = groupedTasks[tf] || [];
          if (tfTasks.length === 0) return null;

          return (
            <div
              key={tf}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs"
            >
              <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                    {tf}
                  </h3>
                </div>
                <span className="text-xs text-neutral-400 font-mono tabular-nums">
                  {tfTasks.filter((t) => t.completed).length} / {tfTasks.length} done
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {tfTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-neutral-50/50 transition-colors ${
                      task.completed ? 'bg-neutral-50/40 text-neutral-400' : 'text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-neutral-300 bg-white hover:border-neutral-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-3" />}
                      </button>
                      <span className={`leading-relaxed ${task.completed ? 'line-through' : 'font-medium'}`}>
                        {task.task}
                      </span>
                    </div>

                    <span className="text-xs text-neutral-400 shrink-0 font-medium">
                      {task.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
