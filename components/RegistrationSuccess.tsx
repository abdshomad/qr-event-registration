import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Attendee } from '../types';
import { CheckCircleIcon } from './Icons';

interface LocationState {
    attendee: Attendee;
    eventName: string;
}

const RegistrationSuccess: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;

    if (!state || !state.attendee || !state.eventName) {
        // Redirect if state is not available
        return <Navigate to="/" replace />;
    }

    const { attendee, eventName } = state;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendee.registrationId)}&bgcolor=1f2937&color=f0f9ff&qzone=1`;

    return (
        <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
                <CheckCircleIcon className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Pendaftaran Berhasil!</h1>
                <p className="text-gray-300 mb-6">
                    Terima kasih, <span className="font-bold text-teal-400">{attendee.name}</span>! Anda telah terdaftar untuk acara <span className="font-bold text-teal-400">{eventName}</span>.
                </p>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 my-6">
                    <h2 className="text-lg font-semibold text-white mb-3">Kode QR Anda untuk Check-in</h2>
                    <p className="text-sm text-gray-400 mb-4">Simpan atau ambil tangkapan layar kode ini. Anda akan membutuhkannya untuk masuk ke acara.</p>
                     <img src={qrCodeUrl} alt="Your personal QR Code for check-in" className="mx-auto rounded-md shadow-lg border-4 border-gray-700" />
                </div>
                
                <Link 
                    to={`/`} 
                    className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
};

export default RegistrationSuccess;