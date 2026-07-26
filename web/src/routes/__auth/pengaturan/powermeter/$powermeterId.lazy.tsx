import { useAuth } from '../../../../auth'
import { Api } from '../../../../api/internal'
import { createLazyFileRoute, Link, Outlet } from '@tanstack/react-router'
import { useQuery } from 'react-query'
import { AxiosError } from 'axios'
import { getPowermeter, Powermeter } from '../../../../api/powermeter'
import ListRegister from '../../../../components/powermeter/ListRegister'

export const Route = createLazyFileRoute('/__auth/pengaturan/powermeter/$powermeterId')({
  component: PowermeterDetail
})

function PowermeterDetail() {

  const auth = useAuth()
  const { powermeterId } = Route.useParams()
  const { data } = useQuery<Api<Powermeter[]>, AxiosError>({
    queryKey: ['powermeter', auth.token],
    queryFn: getPowermeter,
    retry: 2
  })
  const powermter_data = data?.results.find(item => item.id == powermeterId)
  return(
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="col-span-1 lg:col-span-2">
          <p className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1">Seri Powermeter</p>
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{powermter_data?.seri}</p>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <p className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1">Brand Powermeter</p>
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{powermter_data?.brand}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Slave ID</p>
          <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300">{powermter_data?.slave_id ?? 1}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Count</p>
          <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300">{powermter_data?.count ?? 2}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Timeout</p>
          <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300">{powermter_data?.timeout ?? 4}s</p>
        </div>
      </div>

      <div className='mt-8 mb-10 flex flex-wrap gap-4'>
        <Link
          to='/pengaturan/powermeter/$powermeterId/edit'
          params={{ powermeterId: powermeterId as string }}
          className='inline-flex items-center justify-center py-2.5 px-6 rounded-lg font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors'>
          Edit Powermeter
        </Link>
        <Link
          to='/pengaturan/powermeter/$powermeterId/hapus'
          params={{ powermeterId: powermeterId as string }}
          className='inline-flex items-center justify-center py-2.5 px-6 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-500/20'>
          Hapus Powermeter
        </Link>
      </div>

      {/* Daftar Register inline */}
      <ListRegister auth={auth} powermeterId={powermeterId as string} />

      <Outlet />
    </div>
  )
}
