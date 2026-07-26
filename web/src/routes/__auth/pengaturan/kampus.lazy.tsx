import { Api } from "@/api/internal";
import { Kampus as KampusInf, getKampus, removeKampus } from "@/api/kampus";
import { useAuth } from "@/auth";
import Errors from "@/components/Errors";
import Loadings from "@/components/Loadings";
import {
  Link,
  Outlet,
  createLazyFileRoute,
  useParams,
} from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  ChevronRightIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { CompEmptyState } from "@/common";
import { Building2, Pencil, Trash2, Fingerprint, AlertTriangle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';

export const Route = createLazyFileRoute("/__auth/pengaturan/kampus")({
  component: Kampus,
});

function Kampus() {
  const auth = useAuth();
  const { permissions } = auth;
  const { kampusId } = useParams({ strict: false });
  const { isLoading, isError, error, isSuccess, data } = useQuery<
    Api<KampusInf[]>,
    AxiosError
  >({
    queryKey: ["kampus", auth.token],
    queryFn: getKampus,
    retry: 2,
  });
  const kampus_id = data?.results.find((item) => item.id == kampusId);

  return (
    <div>
      <header>
        <h2 className="py-1 flex gap-1 items-center">
          <Link to="/pengaturan/kampus" className="text-2xl">
            Kampus
          </Link>{" "}
          {kampus_id && (
            <>
              <ChevronRightIcon className="w-6 h-6 inline" />{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {kampus_id.name}
              </span>
            </>
          )}
        </h2>
        {permissions.includes("kampus.create") && (
          <Link
            to="/pengaturan/kampus/baru"
            className="bg-blue-600 hover:bg-blue-700 py-2 px-5 mb-2 mt-3 text-white font-medium rounded-lg inline-block transition shadow-sm"
          >
            Tambah Kampus
          </Link>
        )}
      </header>
      <main className="mt-5">
        {isLoading && <Loadings />}
        {isError && (
          <Errors
            process="mendapatkan data list kampus"
            message={error}
            action={
              <Link
                className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
                to="/pengaturan/kampus/baru"
              >
                Tambah Kampus
              </Link>
            }
          />
        )}
        {isSuccess && !kampusId && <ListKampus data={data} kampus_id="" />}
        <Outlet />
      </main>
    </div>
  );
}

function ListKampus(props: { data: Api<KampusInf[]>; kampus_id: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<'move' | 'cascade'>('move');
  const [moveToId, setMoveToId] = useState<string>('');
  const auth = useAuth();
  const { permissions } = auth;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: removeKampus,
    onSuccess: () => {
      toast.success('Data kampus berhasil dihapus');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal menghapus data kampus';
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["kampus", auth.token]);
      setDeleteId(null);
    }
  });

  const handleDelete = () => {
    if (deleteId) {
      if (deleteMode === 'move' && !moveToId) {
         toast.error('Pilih kampus tujuan pemindahan terlebih dahulu');
         return;
      }
      mutation.mutate({ 
        id: deleteId, 
        token: auth.token,
        mode: deleteMode,
        move_to_id: deleteMode === 'move' ? moveToId : undefined
      });
    }
  };

  // Helper to get available kampus for moving (exclude the one being deleted)
  const availableKampus = props.data.results?.filter(k => k.id !== deleteId) || [];
  
  // Set default move_to_id when dialog opens
  if (deleteId && deleteMode === 'move' && !moveToId && availableKampus.length > 0) {
    setMoveToId(availableKampus[0].id);
  }

  if (!props.data.results || props.data.results.length === 0) {
    return (
      <CompEmptyState
        title="Belum Ada Data Kampus"
        description="Saat ini belum ada data kampus yang terdaftar. Silakan tambahkan kampus baru."
        icon={<BuildingLibraryIcon className="w-8 h-8" />}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {props.data.results.map((kampus) => {
          return (
            <div key={kampus.id} className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-6 flex flex-col justify-between gap-6 relative overflow-hidden transition-all hover:shadow-md dark:hover:shadow-slate-900/50">
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm">
                    <Building2 size={26} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {kampus?.name || 'Nama Tidak Ditemukan'}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 bg-slate-50/80 dark:bg-slate-900/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  <Fingerprint size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">ID Identitas:</span>
                  <code className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono text-xs shadow-sm">
                    {kampus.id}
                  </code>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 relative z-10 md:pt-2">
                {permissions.includes("kampus.edit") && (
                  <Link
                    to="/pengaturan/kampus/$kampusId/edit"
                    params={{ kampusId: kampus.id }}
                    className="group flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 active:scale-[0.98]"
                  >
                    <Pencil size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    Edit
                  </Link>
                )}
                {permissions.includes("kampus.delete") && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteId(kampus.id);
                    }}
                    className="group flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white hover:border-red-600 dark:hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:outline-none focus:ring-4 focus:ring-red-500/20 active:scale-[0.98]"
                  >
                    <Trash2 size={16} className="text-red-500 dark:text-red-500 group-hover:text-white transition-colors" />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Transition appear show={!!deleteId} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !mutation.isLoading && setDeleteId(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                      <AlertTriangle size={24} />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-slate-900 dark:text-white"
                    >
                      Konfirmasi Hapus
                    </Dialog.Title>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Apakah Anda yakin ingin menghapus data kampus ini? Silakan pilih bagaimana menangani data Unit di dalamnya:
                    </p>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="mode-move"
                            name="delete-mode"
                            type="radio"
                            checked={deleteMode === 'move'}
                            onChange={() => setDeleteMode('move')}
                            className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-600 bg-white dark:bg-slate-900 dark:border-slate-600 dark:checked:bg-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="mode-move" className="font-medium text-slate-900 dark:text-slate-200">
                            Pindahkan Data Unit
                          </label>
                          <p className="text-slate-500 dark:text-slate-400">Pindahkan semua Unit di dalamnya ke kampus lain.</p>
                        </div>
                      </div>
                      
                      {deleteMode === 'move' && (
                        <div className="ml-7 mt-2">
                          <select
                            value={moveToId}
                            onChange={(e) => setMoveToId(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                          >
                            <option value="" disabled>Pilih Kampus Tujuan</option>
                            {availableKampus.map(k => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </select>
                          {availableKampus.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Tidak ada kampus lain yang tersedia untuk tujuan pemindahan.</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-start pt-2">
                        <div className="flex h-6 items-center">
                          <input
                            id="mode-cascade"
                            name="delete-mode"
                            type="radio"
                            checked={deleteMode === 'cascade'}
                            onChange={() => setDeleteMode('cascade')}
                            className="h-4 w-4 rounded-full border-gray-300 text-red-600 focus:ring-red-600 bg-white dark:bg-slate-900 dark:border-slate-600 dark:checked:bg-red-500"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="mode-cascade" className="font-medium text-red-600 dark:text-red-400">
                            Hapus Beserta Seluruh Data (Bahaya)
                          </label>
                          <p className="text-slate-500 dark:text-slate-400">Hapus Kampus ini, beserta seluruh Unit, Gedung, Device, dan <strong className='text-red-500 font-bold'>Data Historis Listrik</strong> di dalamnya secara permanen.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={mutation.isLoading}
                      className="inline-flex justify-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                      onClick={() => setDeleteId(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                      onClick={handleDelete}
                      disabled={mutation.isLoading || (deleteMode === 'move' && !moveToId)}
                    >
                      {mutation.isLoading ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
