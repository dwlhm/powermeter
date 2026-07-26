import { Link, createLazyFileRoute } from '@tanstack/react-router'
import React from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../../../../auth'
import Errors from '../../../../components/Errors'
import Loadings from '../../../../components/Loadings'
import { addRegister } from '../../../../api/register'
import { useRegisterQuery } from '../../../../components/powermeter/hooks'
import { CompModal } from '@/common'

export const Route = createLazyFileRoute(
  '/__auth/pengaturan/powermeter/$powermeterId/register/$registerId/hapus',
)({
  component: HapusRegister,
})

function HapusRegister() {
  const auth = useAuth()
  const { powermeterId, registerId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const { data: registers, isLoading } = useRegisterQuery(auth, powermeterId)
  const register = registers[Number(registerId)]
  const mutation = useMutation({
    mutationFn: addRegister,
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onRemove = () => {
    setIsSubmitting(true)
    const newData = [...registers]
    newData.splice(Number(registerId), 1)

    mutation.mutate(
      {
        token: auth.token,
        data: {
          register: JSON.stringify(newData),
          powermeter: { id: powermeterId },
        },
      },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          toast.success('Register berhasil dihapus')
          navigate({
            to: '/pengaturan/powermeter/$powermeterId',
            params: { powermeterId },
          })
        },
        onError: (error: any) => {
          setIsSubmitting(false)
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            'Gagal menghapus register'
          toast.error(errorMessage)
        },
      },
    )
  }

  return (
    <CompModal
      title="Hapus Register"
      closeTo="/pengaturan/powermeter/$powermeterId"
      closeParams={{ powermeterId }}
      className="max-w-md"
    >
      {isLoading ? (
        <Loadings />
      ) : !register ? (
        <Errors process="memuat register" message="Register tidak ditemukan" />
      ) : (
        <div className="mb-4">
          <p className="text-slate-700 dark:text-slate-300">
            Yakin menghapus register ini?
          </p>
          <div className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                Alamat
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {String(register[0])}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                Pengkali
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {String(register[1])}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                Besaran
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {register[2]}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                Nama
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {register[3]}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                Param
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {register[4]}
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-5">
            <button
              onClick={onRemove}
              disabled={isSubmitting}
              className="bg-red-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-red-600 transition-colors hover:bg-red-700"
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </button>
            <Link
              to="/pengaturan/powermeter/$powermeterId"
              params={{ powermeterId }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
          {mutation.isError && (
            <Errors
              className="mt-4"
              process="hapus register"
              message={mutation.error as AxiosError}
            />
          )}
        </div>
      )}
    </CompModal>
  )
}
