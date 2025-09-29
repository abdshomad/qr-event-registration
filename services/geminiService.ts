import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateEventDescription = async (eventName: string, eventDate: string): Promise<string> => {
    if (!API_KEY) {
        return "Fungsionalitas AI dinonaktifkan. Harap atur kunci API Anda.";
    }

    const prompt = `Buat deskripsi acara yang menarik dan singkat untuk acara bernama "${eventName}" yang akan diadakan pada ${eventDate}. Deskripsi harus sekitar 2-3 kalimat dan menarik orang untuk mendaftar.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating event description:", error);
        return "Terjadi kesalahan saat membuat deskripsi. Silakan coba lagi atau tulis secara manual.";
    }
};