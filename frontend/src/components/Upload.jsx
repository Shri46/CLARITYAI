import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadStatement } from '../api';
import { CloudArrowUpIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

const Upload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [processingState, setProcessingState] = useState(''); // 'parsing', 'rules', 'ai', 'done', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setErrorMsg('');
      setProcessingState('parsing');
      
      // We simulate stages for better UX as they happen fast on backend
      setTimeout(() => setProcessingState('rules'), 800);
      setTimeout(() => setProcessingState('ai'), 2000);
      
      const response = await uploadStatement(file);
      
      setProcessingState('done');
      if (onUploadSuccess) onUploadSuccess(response);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      console.error(err);
      setProcessingState('error');
      setErrorMsg(err.response?.data?.error || 'Failed to analyze statement.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Upload Statement</h2>
        <p className="text-slate-400 mt-2 text-sm">Upload your bank CSV file to automatically categorize expenses using AI.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
            ? 'border-teal-500 bg-teal-500/10 shadow-inner' 
            : 'border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/50 hover:shadow-lg'
          }`}
        >
          <input id="fileInput" type="file" className="hidden" accept=".csv" onChange={handleChange} />
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center text-teal-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          {file ? (
            <p className="text-teal-400 font-bold text-lg">{file.name}</p>
          ) : (
            <>
              <p className="mt-2 text-slate-300 font-medium text-lg">Drag & drop your CSV here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

      {file && !processingState && (
        <button 
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold py-3.5 rounded-xl hover:from-teal-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? 'Processing via AI...' : 'Analyze Statement'}
        </button>
      )}
      </form>

      {processingState && processingState !== 'done' && processingState !== 'error' && (
        <div className="mt-12 w-full max-w-md">
          <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
            <span className={processingState === 'parsing' ? 'text-teal-600 delay-100 font-bold' : ''}>1. Parsing File</span>
            <span className={processingState === 'rules' ? 'text-teal-600 delay-100 font-bold' : ''}>2. Running Rules (Fast)</span>
            <span className={processingState === 'ai' ? 'text-purple-600 delay-100 font-bold flex items-center gap-1' : 'text-gray-400'}>
              <DocumentChartBarIcon className="w-4 h-4" /> 3. Asking Gemini AI
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-700 ease-out ${processingState === 'ai' ? 'bg-purple-500' : 'bg-teal-500'}`} 
              style={{ width: processingState === 'parsing' ? '20%' : processingState === 'rules' ? '60%' : '95%' }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
            Processing your transactions...
          </p>
        </div>
      )}

      {processingState === 'error' && (
        <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
          <p className="font-semibold">Oops, something went wrong.</p>
          <p className="text-sm mt-1">{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;
