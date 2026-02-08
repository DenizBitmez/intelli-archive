import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';

const UploadComponent = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
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
            // response.data = { filename, status, task_id }
            onUploadSuccess(response.data);
        } catch (err) {
            console.error(err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800">Upload Document</h2>
            <p className="text-slate-500 max-w-sm">
                Select a PDF or text file to analyze. AI will generate a summary and tags.
            </p>

            <div className="w-full max-w-sm space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                            {file ? file.name : "Click to select a file"}
                        </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                </label>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                        </>
                    ) : (
                        "Start Analysis"
                    )}
                </button>
            </div>
        </div>
    );
};

export default UploadComponent;
