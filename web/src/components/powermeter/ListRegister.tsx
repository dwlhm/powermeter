import { useRegisterQuery } from "./hooks";
import { AuthContext } from "../../auth";
import Loadings from "../Loadings";
import { Link } from "@tanstack/react-router";

export default function ListRegister(props: {
  auth: AuthContext;
  powermeterId: string;
}) {
  const { data: register, isLoading: rLoading } = useRegisterQuery(
    props.auth,
    props.powermeterId,
  );

  if (rLoading) return <Loadings />;

  return (
    <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Register</h3>
        <Link
          to="/pengaturan/powermeter/$powermeterId/register/baru"
          params={{ powermeterId: props.powermeterId }}
          className="bg-blue-600 py-2 px-4 rounded-lg text-white transition-colors hover:bg-blue-700 font-medium shadow-sm"
        >
          Tambah Register
        </Link>
      </div>

      <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm bg-white dark:bg-slate-900 flex flex-col relative">
        <div className="register-table font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 sticky top-0 z-10 shadow-sm backdrop-blur-md">
          <p className="p-3">Alamat (Desimal)</p>
          <p className="p-3">Pengkali</p>
          <p className="p-3">Besaran</p>
          <p className="p-3">Nama</p>
          <p className="p-3">Param</p>
          <p className="p-3">Aksi</p>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {register.map((data, i) => (
            <div className="register-table" key={`register-item_${i}`}>
              <p>{String(data[0])}</p>
              <p>{String(data[1])}</p>
              <p>{data[2]}</p>
              <p>{data[3]}</p>
              <p>{data[4]}</p>
              <div className="flex gap-2 justify-center">
                <Link
                  to="/pengaturan/powermeter/$powermeterId/register/$registerId/edit"
                  params={{
                    powermeterId: props.powermeterId,
                    registerId: String(i),
                  }}
                  className="text-sm bg-blue-600 dark:bg-blue-700 text-white py-1.5 px-3 rounded-lg w-full transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm font-medium text-center"
                >
                  Edit
                </Link>
                <Link
                  to="/pengaturan/powermeter/$powermeterId/register/$registerId/hapus"
                  params={{
                    powermeterId: props.powermeterId,
                    registerId: String(i),
                  }}
                  className="text-sm bg-red-600 dark:bg-red-700 text-white py-1.5 px-3 rounded-lg w-full transition-colors hover:bg-red-700 dark:hover:bg-red-600 shadow-sm font-medium text-center"
                >
                  Hapus
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
