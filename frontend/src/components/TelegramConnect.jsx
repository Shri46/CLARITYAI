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
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl mb-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-2xl shadow-sm flex-shrink-0">
            ✈️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Telegram Expense Assistant</h3>
              {status.telegramLinked ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  Connected
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                  Not Linked
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Log expenses instantly on the go by sending messages like <span className="text-slate-800 font-medium font-mono">"500 for Swiggy"</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {status.telegramLinked ? (
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open Telegram Chat</span> ↗
            </a>
          ) : (
            <>
              <a
                href={directLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center bg-teal-700 hover:bg-teal-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-teal-700/15 flex items-center justify-center gap-1.5"
              >
                <span>Connect Telegram</span> ↗
              </a>
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs border border-slate-300 font-medium transition-all shadow-sm"
                title="Scan QR Code"
              >
                📱 QR Code
              </button>
            </>
          )}
        </div>
      </div>

      {showQR && !status.telegramLinked && (
        <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col items-center text-center">
          <p className="text-slate-700 text-xs font-semibold mb-3">Scan with Phone Camera or Telegram to link:</p>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-md">
            <img src={qrUrl} alt="Telegram Link QR Code" className="w-36 h-36 rounded-md" />
          </div>
          <p className="text-slate-500 text-xs mt-3">
            Or send your account email <span className="text-teal-700 font-semibold font-mono">{status.email}</span> to the bot in Telegram.
          </p>
        </div>
      )}
    </div>
  );
};

export default TelegramConnect;
