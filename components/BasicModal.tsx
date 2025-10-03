'use client';

interface ModalProps {
  handleConfirm: any;
  setDeleteModal: any;
}

export default function BasicModal({ handleConfirm, setDeleteModal }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl border border-slate-300 shadow-lg max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Delete Entry</h2>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-slate-400 text-slate-700 hover:bg-slate-100 transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteModal(false);
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
