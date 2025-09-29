import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { Event, Attendee } from '../types';
import { CheckCircleIcon } from './Icons';

interface CheckInProps {
    allEvents: Event[];
    allAttendees: Attendee[];
    checkInAttendee: (registrationId: string) => Promise<Attendee>;
}

const SCANNER_REGION_ID = "qr-scanner-region";

const CheckIn: React.FC<CheckInProps> = ({ allEvents, allAttendees, checkInAttendee }) => {
    const { id: eventId } = useParams<{ id: string }>();
    const event = allEvents.find(e => e.id === eventId);
    
    const [scanResult, setScanResult] = useState<Attendee | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    
    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner(
            SCANNER_REGION_ID,
            {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            },
            /* verbose= */ false
        );
        scannerRef.current = scanner;

        const onScanSuccess = async (decodedText: string) => {
            scanner.pause(true); // Pause scanner
            
            try {
                const attendee = allAttendees.find(a => a.registrationId === decodedText);
                if (!attendee) {
                    throw new Error("Kode QR tidak valid atau peserta tidak ditemukan.");
                }
                if (attendee.eventId !== eventId) {
                    throw new Error(`Peserta ini terdaftar untuk acara yang berbeda (${allEvents.find(e => e.id === attendee.eventId)?.name || 'Tidak Diketahui'}).`);
                }
                
                const checkedInAttendee = await checkInAttendee(decodedText);
                setScanResult(checkedInAttendee);
                setScanError(null);

                // Automatically resume after 3 seconds
                setTimeout(() => {
                    setScanResult(null);
                    if (scannerRef.current?.getState() === Html5QrcodeScannerState.PAUSED) {
                       scanner.resume();
                    }
                }, 3000);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
                setScanError(errorMessage);
                setScanResult(null);
                
                // Automatically resume after 3 seconds
                setTimeout(() => {
                    setScanError(null);
                    if (scannerRef.current?.getState() === Html5QrcodeScannerState.PAUSED) {
                        scanner.resume();
                    }
                }, 3000);
            }
        };

        const onScanFailure = (error: any) => {
            // ignore scan failure
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(error => {
                console.error("Gagal membersihkan Html5QrcodeScanner.", error);
            });
        };
    }, [isScanning, allAttendees, eventId, checkInAttendee]);

    if (!event) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-500">Acara tidak ditemukan</h2>
                <Link to="/" className="text-teal-400 hover:underline mt-4 inline-block">Kembali ke Dasbor</Link>
            </div>
        );
    }
    
    return (
        <div className="max-w-xl mx-auto">
            <Link to={`/event/${eventId}`} className="text-teal-400 hover:text-teal-300 mb-6 inline-block">&larr; Kembali ke Detail Acara</Link>
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                <h1 className="text-3xl font-bold text-white">Check-in untuk</h1>
                <p className="text-xl text-teal-400 mb-6">{event.name}</p>
                
                <div id={SCANNER_REGION_ID} className="w-full rounded-lg overflow-hidden border-2 border-gray-700"></div>

                {scanResult && (
                    <div className="mt-6 p-4 rounded-lg bg-green-900/50 text-green-300 animate-pulse">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-2"/>
                        <p className="font-bold">Check-in Berhasil!</p>
                        <p>Selamat datang, {scanResult.name}!</p>
                    </div>
                )}

                {scanError && (
                     <div className="mt-6 p-4 rounded-lg bg-red-900/50 text-red-300">
                        <p className="font-bold">Gagal!</p>
                        <p>{scanError}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckIn;