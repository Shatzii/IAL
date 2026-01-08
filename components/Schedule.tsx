
import React, { useState, useMemo } from 'react';
import { LeagueEvent, Franchise } from '../types';
import { useApp } from '../App';

const MOCK_EVENTS: LeagueEvent[] = [
  {
    id: 'e1',
    title: 'Nottingham Combine - North',
    date: '2024-03-15',
    time: '09:00',
    location: 'Nottingham Performance Centre',
    franchise: Franchise.NOTTINGHAM,
    type: 'Combine',
    status: 'Scheduled'
  },
  {
    id: 'e2',
    title: 'Season Opening Draft',
    date: '2024-04-01',
    time: '18:30',
    location: 'IAL Headquarters - London',
    franchise: 'League Wide',
    type: 'Draft',
    status: 'Scheduled'
  },
  {
    id: 'e3',
    title: 'Zürich Open Tryouts',
    date: '2024-03-20',
    time: '10:00',
    location: 'Stadion Letzigrund',
    franchise: Franchise.ZURICH,
    type: 'Tryout',
    status: 'Scheduled'
  },
  {
    id: 'e4',
    title: 'Stuttgart Pre-Season Training',
    date: '2024-04-10',
    time: '14:00',
    location: 'MHP Arena Stuttgart',
    franchise: Franchise.STUTTGART,
    type: 'Training',
    status: 'Scheduled'
  }
];

export const Schedule: React.FC = () => {
  const { startEvaluation } = useApp();
  const [events, setEvents] = useState<LeagueEvent[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'List' | 'Calendar'>('List');
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 2, 1)); // March 2024
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<LeagueEvent> | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      filter === 'All' || e.franchise === filter || (filter === 'League' && e.franchise === 'League Wide')
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, filter]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (editingEvent.id) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? (editingEvent as LeagueEvent) : ev));
    } else {
      const newEvent = { ...editingEvent, id: `e${Date.now()}` } as LeagueEvent;
      setEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const openCreateModal = () => {
    setEditingEvent({
      title: '',
      date: '2024-03-01',
      time: '12:00',
      location: '',
      franchise: Franchise.NOTTINGHAM,
      type: 'Training',
      status: 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: LeagueEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">IAL Operations Timeline</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Logistics & Strategy Hub</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="bg-league-panel p-1 rounded-lg border border-league-border flex">
            {(['List', 'Calendar'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === mode ? 'bg-league-accent text-white shadow-lg' : 'text-league-muted hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-league-accent hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
          >
            + Create Event
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {['All', 'League', ...Object.values(Franchise)].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === f ? 'bg-league-accent border-league-accent text-white' : 'bg-league-panel border-league-border text-league-muted hover:border-league-muted hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {viewMode === 'List' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-league-panel border border-league-border rounded-xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-league-accent transition-all">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                event.type === 'Match' ? 'bg-league-accent' : 
                event.type === 'Combine' ? 'bg-league-blue' : 
                event.type === 'Draft' ? 'bg-league-ok' : 'bg-league-muted'
              }`} />
              
              <div className="flex-shrink-0 text-center md:w-24">
                <div className="text-[10px] font-black uppercase tracking-widest text-league-accent mb-1">
                  {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(event.date))}
                </div>
                <div className="text-4xl font-black italic leading-none mb-1">
                  {new Date(event.date).getDate()}
                </div>
                <div className="text-[8px] font-bold uppercase tracking-widest text-league-muted">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(event.date))}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-league-border rounded-full text-league-muted bg-league-bg">
                    {event.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-league-ok">{event.status}</span>
                    <button onClick={() => openEditModal(event)} className="text-league-muted hover:text-white transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                  </div>
                </div>
                
                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-league-accent transition-colors">
                  {event.title}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                  <div className="flex items-center gap-2 text-[10px] text-league-muted uppercase font-bold tracking-widest">
                    <svg className="w-3 h-3 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {event.time} Local
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-league-muted uppercase font-bold tracking-widest">
                    <svg className="w-3 h-3 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {event.location}
                  </div>
                </div>

                {(event.type === 'Combine' || event.type === 'Tryout') && (
                  <button 
                    onClick={() => startEvaluation(event)}
                    className="w-full bg-league-accent/10 border border-league-accent/30 text-league-accent hover:bg-league-accent hover:text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Launch Official Evaluator
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-league-panel border border-league-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-league-border flex justify-between items-center bg-league-tableHeader">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-league-bg rounded-full text-league-muted hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h3 className="text-lg font-black italic uppercase tracking-widest">
              {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
            </h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-league-bg rounded-full text-league-muted hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 text-center border-b border-league-border bg-league-tableHeader">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-[10px] font-black uppercase tracking-widest text-league-muted border-r border-league-border last:border-0">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[500px]">
            {calendarDays.map((date, idx) => {
              const dayEvents = date ? filteredEvents.filter(e => e.date === date.toISOString().split('T')[0]) : [];
              return (
                <div key={idx} className={`p-2 border-r border-b border-league-border min-h-[120px] transition-colors ${date ? 'bg-league-panel' : 'bg-league-bg/20'}`}>
                  {date && (
                    <>
                      <div className={`text-[10px] font-black mb-2 ${date.toDateString() === new Date().toDateString() ? 'text-league-accent' : 'text-league-muted'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(e => (
                          <div 
                            key={e.id} 
                            onClick={() => openEditModal(e)}
                            className="text-[9px] font-bold p-1.5 rounded bg-league-bg border border-league-border hover:border-league-accent cursor-pointer truncate transition-all"
                          >
                            <span className="text-league-accent mr-1 font-black">●</span>
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-league-panel border border-league-border max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSaveEvent} className="p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {editingEvent?.id ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-league-muted hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">Event Title</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:border-league-accent outline-none font-bold"
                    value={editingEvent?.title || ''}
                    onChange={e => setEditingEvent(prev => ({ ...prev!, title: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">Date</label>
                    <input 
                      required 
                      type="date" 
                      className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:border-league-accent outline-none font-bold"
                      value={editingEvent?.date || ''}
                      onChange={e => setEditingEvent(prev => ({ ...prev!, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">Time</label>
                    <input 
                      required 
                      type="time" 
                      className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:border-league-accent outline-none font-bold"
                      value={editingEvent?.time || ''}
                      onChange={e => setEditingEvent(prev => ({ ...prev!, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">Franchise Assignment</label>
                  <select 
                    className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white appearance-none focus:border-league-accent outline-none font-bold"
                    value={editingEvent?.franchise || ''}
                    onChange={e => setEditingEvent(prev => ({ ...prev!, franchise: e.target.value as Franchise }))}
                  >
                    <option value="League Wide">League Wide</option>
                    {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">Location</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Stadium, Center, or City"
                    className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:border-league-accent outline-none font-bold"
                    value={editingEvent?.location || ''}
                    onChange={e => setEditingEvent(prev => ({ ...prev!, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-league-bg border border-league-border text-league-muted py-3 rounded-xl font-black italic uppercase tracking-widest text-xs hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-league-accent text-white py-3 rounded-xl font-black italic uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 transition-all"
                >
                  Save Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
