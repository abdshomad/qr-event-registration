import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Event, Attendee } from '../types';
import { UserGroupIcon, CalendarIcon, InformationCircleIcon, QrCodeIcon, CheckBadgeIcon } from './Icons';

interface EventDetailsProps {
    allEvents: Event[];
    allAttendees: Attendee[];
}

const EventDetails: React.FC<EventDetailsProps> = ({ allEvents, allAttendees }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const event = allEvents.find(e => e.id === id);
    const attendees = allAttendees.filter(a => a.eventId === id);

    if (!event) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-500">Acara tidak ditemukan</h2>
                <Link to="/" className="text-teal-400 hover:underline mt-4 inline-block">Kembali ke Dasbor</Link>
            </div>
        );
    }

    const registrationUrl = `${window.location.origin}${window.location.pathname}#/register/${event.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationUrl)}&bgcolor=111827&color=f0f9ff&qzone=1`;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="text-teal-400 hover:text-teal-300 mb-6 inline-block">&larr; Kembali ke Dasbor</Link>

            <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{event.name}</h1>
                        <p className="text-lg text-gray-400 mt-2 flex items-center justify-center md:justify-start gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </p>
                    </div>
                     <button
                        onClick={() => navigate(`/check-in/${event.id}`)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                       <QrCodeIcon className="w-5 h-5" /> Pindai Masuk
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-teal-400 flex items-center gap-2"><InformationCircleIcon className="w-6 h-6"/> Tentang Acara Ini</h2>
                        <p className="text-gray-300 leading-relaxed">{event.description}</p>
                    </div>
                    <div className="text-center p-6 bg-gray-900 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-lg mb-4 text-white">Pindai untuk Mendaftar!</h3>
                        <img src={qrCodeUrl} alt="Registration QR Code" className="mx-auto rounded-md shadow-lg border-4 border-gray-700" />
                        <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 mt-4 hover:text-teal-400 break-all transition-colors">{registrationUrl}</a>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2"><UserGroupIcon className="w-6 h-6" /> Peserta Terdaftar ({attendees.length})</h2>
                    {attendees.length > 0 ? (
                        <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
                            <ul className="divide-y divide-gray-700">
                                {attendees.map((attendee, index) => (
                                    <li key={attendee.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-gray-400 font-mono text-sm mr-4">{String(index + 1).padStart(2, '0')}</span>
                                            <div>
                                                <p className="font-semibold text-white">{attendee.name}</p>
                                                <p className="text-sm text-gray-400">{attendee.email}</p>
                                            </div>
                                        </div>
                                        {attendee.checkedIn && (
                                            <div className="flex items-center gap-1 bg-green-900/50 text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
                                                <CheckBadgeIcon className="w-4 h-4" />
                                                <span>Sudah Masuk</span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8 bg-gray-900/50 rounded-lg border border-gray-700">Belum ada peserta yang mendaftar.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;