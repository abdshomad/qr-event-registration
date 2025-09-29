import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Event, Attendee } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import EventDashboard from './components/EventDashboard';
import EventDetails from './components/EventDetails';
import RegistrationForm from './components/RegistrationForm';
import RegistrationSuccess from './components/RegistrationSuccess';
import CheckIn from './components/CheckIn';
import { GOOGLE_SHEET_WEB_APP_URL } from './config';

const App: React.FC = () => {
    const [events, setEvents] = useLocalStorage<Event[]>('events', []);
    const [attendees, setAttendees] = useLocalStorage<Attendee[]>('attendees', []);

    const addEvent = (event: Omit<Event, 'id'>) => {
        const newEvent: Event = { ...event, id: crypto.randomUUID() };
        setEvents(prevEvents => [...prevEvents, newEvent]);
        return newEvent;
    };

    const addAttendee = async (attendeeInfo: {name: string, email: string}, event: Event): Promise<Attendee> => {
        const newAttendee: Attendee = { 
            id: crypto.randomUUID(),
            registrationId: crypto.randomUUID(),
            eventId: event.id,
            name: attendeeInfo.name,
            email: attendeeInfo.email,
            checkedIn: false
        };
        setAttendees(prevAttendees => [...prevAttendees, newAttendee]);

        if (GOOGLE_SHEET_WEB_APP_URL) {
            try {
                const payload = {
                    action: 'register',
                    eventId: event.id,
                    eventName: event.name,
                    name: newAttendee.name,
                    email: newAttendee.email,
                    registrationId: newAttendee.registrationId
                };

                const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
                    throw new Error(errorData.message || 'Failed to save to Google Sheet');
                }
                const result = await response.json();
                console.log("Google Sheet Save Result:", result.message);
            } catch (error) {
                console.error("Gagal menyimpan ke Google Sheet:", error);
                throw error;
            }
        } else {
            console.warn("URL Aplikasi Web Google Sheet tidak dikonfigurasi.");
        }
        return newAttendee;
    };
    
    const checkInAttendee = async (registrationId: string): Promise<Attendee> => {
        let checkedInAttendee: Attendee | undefined;
        setAttendees(prevAttendees => {
            const newAttendees = prevAttendees.map(attendee => {
                if (attendee.registrationId === registrationId) {
                    if (attendee.checkedIn) {
                        throw new Error("Peserta ini sudah masuk.");
                    }
                    checkedInAttendee = { ...attendee, checkedIn: true };
                    return checkedInAttendee;
                }
                return attendee;
            });
            if (!checkedInAttendee) {
                throw new Error("ID Pendaftaran tidak valid.");
            }
            return newAttendees;
        });

        if (!checkedInAttendee) {
             throw new Error("Gagal menemukan peserta untuk check-in.");
        }

        if (GOOGLE_SHEET_WEB_APP_URL) {
            try {
                const payload = {
                    action: 'checkin',
                    registrationId: registrationId,
                };
                 const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                 if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
                    throw new Error(errorData.message || 'Failed to update Google Sheet');
                }
                const result = await response.json();
                console.log("Google Sheet Check-in Result:", result.message);
            } catch (error) {
                console.error("Gagal memperbarui Google Sheet:", error);
                // Note: We don't re-throw here because the local check-in was successful.
                // You might want to implement a retry mechanism or a way to sync later.
            }
        }
        
        return checkedInAttendee;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <nav className="container mx-auto px-6 py-4">
                    <Link to="/" className="text-2xl font-bold text-teal-400 hover:text-teal-300 transition-colors">
                       Alur Acara QR
                    </Link>
                </nav>
            </header>
            <main className="container mx-auto px-6 py-8">
                <Routes>
                    <Route path="/" element={<EventDashboard events={events} addEvent={addEvent} />} />
                    <Route path="/event/:id" element={<EventDetails allEvents={events} allAttendees={attendees} />} />
                    <Route path="/register/:id" element={<RegistrationForm allEvents={events} addAttendee={addAttendee} />} />
                    <Route path="/success" element={<RegistrationSuccess />} />
                    <Route path="/check-in/:id" element={<CheckIn allEvents={events} allAttendees={attendees} checkInAttendee={checkInAttendee} />} />
                </Routes>
            </main>
            <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
                <p>Didukung oleh Gemini & React</p>
            </footer>
        </div>
    );
};

export default App;