import React from "react";

const Notification = ({
  title = "Notificação",
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          {/* Logo/raio girado */}
          <div className="w-10 h-10 rounded-full bg-[#1A99BA] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white transform rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-800">{title}</div>
        </div>
        <div className="p-4 text-gray-700">
          {message}
        </div>
        <div className="p-4 pt-0 flex justify-end gap-3">
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >{cancelText}</button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]"
          >{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Notification;


