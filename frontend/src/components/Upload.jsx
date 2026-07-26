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
    <div className="max-w-xl mx-auto mt-6 p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center text-teal-700 text-2xl mx-auto mb-3">
          📊
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Bank Statement</h2>
        <p className="text-slate-500 mt-1.5 text-xs">Upload your bank CSV file to automatically categorize transactions using Hybrid AI.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
            ? 'border-teal-700 bg-teal-50/50 shadow-inner' 
            : 'border-slate-300 hover:border-teal-700 hover:bg-slate-50/80'
          }`}
        >
          <input id="fileInput" type="file" className="hidden" accept=".csv" onChange={handleChange} />
          <div className="mx-auto w-14 h-14 mb-3 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          {file ? (
            <p className="text-teal-700 font-bold text-base">{file.name}</p>
          ) : (
            <>
              <p className="text-slate-800 font-semibold text-base">Drag & drop your bank CSV here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse from device</p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

      {file && !processingState && (
        <button 
          onClick={handleUpload}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-blue-700/15 text-sm flex justify-center items-center gap-2"
        >
          <span>Analyze Statement</span>
        </button>
      )}
      </form>

      {processingState && processingState !== 'done' && processingState !== 'error' && (
        <div className="mt-8 w-full">
          <div className="flex justify-between mb-2 text-xs font-medium text-slate-600">
            <span className={processingState === 'parsing' ? 'text-teal-700 font-bold' : ''}>1. Parsing File</span>
            <span className={processingState === 'rules' ? 'text-teal-700 font-bold' : ''}>2. Running Rules</span>
            <span className={processingState === 'ai' ? 'text-indigo-600 font-bold flex items-center gap-1' : 'text-slate-400'}>
              3. Asking Gemini AI
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ease-out ${processingState === 'ai' ? 'bg-indigo-600' : 'bg-teal-700'}`} 
              style={{ width: processingState === 'parsing' ? '25%' : processingState === 'rules' ? '65%' : '95%' }}
            ></div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-3 animate-pulse">
            Processing and categorizing your transactions...
          </p>
        </div>
      )}

      {processingState === 'error' && (
        <div className="mt-6 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-xl text-center text-xs">
          <p className="font-semibold">Oops, failed to analyze statement.</p>
          <p className="mt-0.5">{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;
