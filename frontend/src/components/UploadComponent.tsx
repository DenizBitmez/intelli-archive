import { useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader2, FileUp } from 'lucide-react';

interface UploadComponentProps {
    onUploadSuccess: (data: any) => void;
}

const UploadComponent = ({ onUploadSuccess }: UploadComponentProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadSuccess(response.data);
        } catch (err) {
            console.error(err);
            setError('Upload failed. Please ensure the backend is running.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className={`
                w-full max-w-lg p-10 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center group
                ${dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }
            `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300
                    ${dragActive ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-white group-hover:shadow-md'}
                `}>
                    {file ? (
                        <FileText className="w-10 h-10 text-indigo-600 animate-bounce-short" />
                    ) : (
                        <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-500" />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {file ? 'File Selected' : 'Upload Document'}
                </h2>

                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                    {file
                        ? <span className="text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">{file.name}</span>
                        : 'Drag & drop your PDF or Text file here, or click to browse.'
                    }
                </p>

                <div className="w-full max-w-xs space-y-4">
                    {!file && (
                        <label className="block w-full">
                            <span className="sr-only">Choose file</span>
                            <div className="w-full py-3 px-6 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 cursor-pointer shadow-sm transition-all text-center">
                                Browse Files
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.txt,.md"
                            />
                        </label>
                    )}

                    {file && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFile(null)}
                                disabled={uploading}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-[2] py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Start Analysis <FileUp className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                    <span className="block w-2 h-2 bg-red-500 rounded-full"></span>
                    {error}
                </div>
            )}
        </div>
    );
};

export default UploadComponent;
