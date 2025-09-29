import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Event } from '../types';
import { generateEventDescription } from '../services/geminiService';
import { CalendarIcon, PlusIcon, SparklesIcon, ChevronRightIcon } from './Icons';

interface EventDashboardProps {
    events: Event[];
    addEvent: (event: Omit<Event, 'id'>) => Event;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ events, addEvent }) => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const navigate = useNavigate();

    const handleGenerateDescription = async () => {
        if (!eventName || !eventDate) {
            alert("Silakan masukkan nama dan tanggal acara terlebih dahulu.");
            return;
        }
        setIsAiLoading(true);
        try {
            const description = await generateEventDescription(eventName, eventDate);
            setEventDescription(description);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName || !eventDate || !eventDescription) {
            alert("Silakan isi semua kolom.");
            return;
        }
        const newEvent = addEvent({ name: eventName, date: eventDate, description: eventDescription });
        setEventName('');
        setEventDate('');
        setEventDescription('');
        navigate(`/event/${newEvent.id}`);
    };
    
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <h1 className="text-4xl font-bold text-white">Buat Acara Baru</h1>
                <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-800 rounded-lg shadow-lg">
                    <div>
                        <label htmlFor="eventName" className="block text-sm font-medium text-gray-300 mb-1">Nama Acara</label>
                        <input
                            id="eventName"
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="cth., Konferensi Inovator Teknologi"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300 mb-1">Tanggal Acara</label>
                        <input
                            id="eventDate"
                            type="date"
                            value={eventDate}
                            min={today}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-300 mb-1">Deskripsi</label>
                        <div className="relative">
                            <textarea
                                id="eventDescription"
                                value={eventDescription}
                                onChange={(e) => setEventDescription(e.target.value)}
                                placeholder="Ringkasan singkat acara Anda..."
                                rows={4}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isAiLoading}
                                className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 text-white font-semibold py-1 px-2 rounded-md transition-colors"
                            >
                                {isAiLoading ? (
                                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                ) : (
                                    <SparklesIcon className="w-4 h-4" />
                                )}
                                {isAiLoading ? 'Membuat...' : 'Buat dengan AI'}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                       <PlusIcon className="w-5 h-5" /> Buat Acara
                    </button>
                </form>
            </div>
            <div className="space-y-6">
                <h2 className="text-4xl font-bold text-white">Acara Anda</h2>
                {events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map(event => (
                            <Link to={`/event/${event.id}`} key={event.id} className="block bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700/80 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-teal-400">{event.name}</h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                            <CalendarIcon className="w-4 h-4"/>
                                            {new Date(event.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                        </p>
                                    </div>
                                    <ChevronRightIcon className="w-6 h-6 text-gray-500" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">Anda belum membuat acara apa pun.</p>
                        <p className="text-gray-500 text-sm mt-1">Gunakan formulir untuk memulai!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDashboard;