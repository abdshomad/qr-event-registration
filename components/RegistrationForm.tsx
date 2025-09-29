import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Event, Attendee } from '../types';

interface RegistrationFormProps {
    allEvents: Event[];
    addAttendee: (attendeeInfo: { name: string; email: string; }, event: Event) => Promise<Attendee>;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ allEvents, addAttendee }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const event = allEvents.find(e => e.id === id);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !event) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const newAttendee = await addAttendee({ name, email }, event);
            navigate('/success', { state: { attendee: newAttendee, eventName: event.name } });
        } catch (err) {
            console.error("Submission failed:", err);
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
            setError(`Pendaftaran gagal: ${errorMessage}. Silakan coba lagi.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!event) {
        return (
            <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-red-500">Acara tidak ditemukan</h2>
                <p className="text-gray-400 mt-2">Acara yang Anda coba daftarkan tidak ada atau tautannya tidak valid.</p>
                <Link to="/" className="text-teal-400 hover:underline mt-4 inline-block">Kembali ke halaman utama</Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
                <div className="text-center mb-6">
                    <p className="text-gray-400">Anda mendaftar untuk</p>
                    <h1 className="text-3xl font-bold text-teal-400">{event.name}</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {new Date(event.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Budi Santoso"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Alamat Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="anda@contoh.com"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                Mengirim...
                            </>
                        ) : (
                            'Daftar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;