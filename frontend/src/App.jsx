import { useState } from 'react'
import './App.css'
import UploadComponent from './components/UploadComponent';
import ChatComponent from './components/ChatComponent';
import { FileText, RefreshCw } from 'lucide-react';

function App() {
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleUploadSuccess = (data) => {
        // data = { filename, status, task_id }
        setUploadedFile(data.filename);
    };

    const reset = () => {
        setUploadedFile(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    IntelliArchive
                </h1>
                <p className="text-slate-600 mt-2">AI-Powered Intelligent Document Management</p>
            </header>

            <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 min-h-[400px] border border-slate-100 flex flex-col">
                {!uploadedFile ? (
                    <UploadComponent onUploadSuccess={handleUploadSuccess} />
                ) : (
                    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-slate-700">{uploadedFile}</span>
                            </div>
                            <button
                                onClick={reset}
                                className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Upload New
                            </button>
                        </div>
                        <ChatComponent filename={uploadedFile} />
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
