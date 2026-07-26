import { Powermeter, getPowermeter, removePowermeter } from '../../../../api/powermeter'
import { Api } from '../../../../api/internal'
import { useAuth } from '../../../../auth'
import Errors from '../../../../components/Errors'
import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import React from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { CompModal } from '@/common'

export const Route = createLazyFileRoute('/__auth/pengaturan/powermeter/$powermeterId/hapus')({
  component: HapusPowermeter
})

function HapusPowermeter() {

  const queryClient = useQueryClient()
  const auth = useAuth()
  const { powermeterId } = Route.useParams()
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const { data } = useQuery<Api<Powermeter[]>, AxiosError>({
    queryKey: ['powermeter', auth.token],
    queryFn: getPowermeter,
    retry: 2
  })
  const powermeter_data = data?.results.find(item => item.id == powermeterId)
  const mutation = useMutation({
    mutationFn: removePowermeter,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })

  const onRemove = () => {
    setIsSubmitting(true)
    mutation.mutate({
      token: auth.token,
      id: powermeterId
    }, {
      onSuccess: () => {
        setIsSubmitting(false)
        toast.success('Powermeter berhasil dihapus')
        navigate({ to: "/pengaturan/powermeter" })
      },
      onError: (error: any) => {
        setIsSubmitting(false)
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          'Gagal menghapus powermeter'
        toast.error(errorMessage)
      }
    })
  }

  return(
    <CompModal
      title="Hapus Powermeter"
      closeTo="/pengaturan/powermeter/$powermeterId"
      closeParams={{ powermeterId }}
      className="max-w-md"
    >
      <div className="mb-4">
        <p className="text-slate-700 dark:text-slate-300">
          Yakin menghapus powermeter ini?
        </p>
        {powermeter_data && (
          <div className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Seri</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{powermeter_data.seri}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Brand</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{powermeter_data.brand}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Slave ID</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{powermeter_data.slave_id ?? 1}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Count</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{powermeter_data.count ?? 2}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Timeout</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{powermeter_data.timeout ?? 4}s</p>
            </div>
          </div>
        )}
        <div className="flex gap-4 mt-5">
          <button
            onClick={onRemove}
            disabled={isSubmitting}
            className="bg-red-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-red-600 transition-colors hover:bg-red-700"
          >
            {isSubmitting ? 'Menghapus...' : 'Hapus'}
          </button>
          <Link
            to='/pengaturan/powermeter/$powermeterId'
            params={{ powermeterId }}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Batalkan
          </Link>
        </div>
        {mutation.isError && (
          <Errors
            className="mt-4"
            process="hapus powermeter"
            message={mutation.error as AxiosError}
          />
        )}
      </div>
    </CompModal>
  )
}
