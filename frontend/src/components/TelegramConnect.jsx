import React, { useState, useEffect } from 'react';
import { getUserStatus } from '../api';

const TelegramConnect = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    getUserStatus()
      .then(res => {
        setStatus(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !status) return null;

  const botUsername = status.botUsername || 'ClarityAIBot';
  const directLink = `https://t.me/${botUsername}?start=${status._id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(directLink)}&color=0f172a&bgcolor=38bdf8`;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-sky-500/20 flex-shrink-0">
            ✈️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Telegram Assistant</h3>
              {status.telegramLinked ? (
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  Connected
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 font-medium">
                  Not Linked
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Log expenses directly from Telegram by sending messages like <span className="text-slate-200 font-mono">"500 for Swiggy"</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {status.telegramLinked ? (
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Open Bot Chat</span> ↗
            </a>
          ) : (
            <>
              <a
                href={directLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
              >
                <span>Connect Telegram</span> ↗
              </a>
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-sm border border-slate-700 transition-all"
                title="Scan QR Code"
              >
                📱 QR
              </button>
            </>
          )}
        </div>
      </div>

      {showQR && !status.telegramLinked && (
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col items-center text-center animate-fadeIn">
          <p className="text-slate-300 text-xs font-semibold mb-3">Scan with Phone Camera or Telegram to connect:</p>
          <div className="p-3 bg-white rounded-2xl shadow-xl">
            <img src={qrUrl} alt="Telegram Link QR Code" className="w-40 h-40 rounded-lg" />
          </div>
          <p className="text-slate-400 text-xs mt-3">
            Or manually send your email <span className="text-sky-400 font-mono">{status.email}</span> to the bot in Telegram.
          </p>
        </div>
      )}
    </div>
  );
};

export default TelegramConnect;
