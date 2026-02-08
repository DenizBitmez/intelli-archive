import { useState } from 'react'
import './App.css'
// @ts-ignore
import UploadComponent from './components/UploadComponent';
// @ts-ignore
import ChatComponent from './components/ChatComponent';
import { FileText, RefreshCw, Zap } from 'lucide-react';

function App() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadedFile(data.filename);
  };

  const reset = () => {
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <header className="mb-10 text-center flex flex-col items-center animate-fade-in-down">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight mb-2">
          IntelliArchive
        </h1>
        <p className="text-lg text-slate-500 max-w-md">
          Smart document analysis powered by <span className="font-semibold text-blue-600">Gemini AI</span>
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-100/50 p-1 min-h-[500px] border border-white/20 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          {!uploadedFile ? (
            <UploadComponent onUploadSuccess={handleUploadSuccess} />
          ) : (
            <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                  <div className="p-1.5 bg-white rounded-full shadow-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-blue-700 text-sm">{uploadedFile}</span>
                </div>
                <button
                  onClick={reset}
                  className="text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 group"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Analyze New File
                </button>
              </div>
              <ChatComponent filename={uploadedFile} />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} IntelliArchive. Powered by Google Gemini 1.5 Flash.</p>
      </footer>
    </div>
  )
}

export default App
