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
  '/__auth/pengaturan/powermeter/$powermeterId/register/$registerId/edit',
)({
  component: EditRegister,
})

function EditRegister() {
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

  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const alamat = Number(data.get('alamat'))
      const pengkali = Number(data.get('pengkali'))
      const besaran = data.get('besaran')?.toString()
      const nama = data.get('nama')?.toString()
      const param = data.get('param')?.toString()

      if (isNaN(alamat) || isNaN(pengkali) || !besaran || !nama || !param) {
        setIsSubmitting(false)
        return
      }

      const newData = [...registers]
      newData[Number(registerId)] = [alamat, pengkali, besaran, nama, param]

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
            toast.success('Berhasil mengubah register')
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
              'Gagal mengubah register'
            toast.error(errorMessage)
          },
        },
      )
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
      toast.error('Terjadi kesalahan yang tidak terduga')
    }
  }

  return (
    <CompModal
      title="Edit Register"
      closeTo="/pengaturan/powermeter/$powermeterId"
      closeParams={{ powermeterId }}
    >
      {isLoading ? (
        <Loadings />
      ) : !register ? (
        <Errors process="memuat register" message="Register tidak ditemukan" />
      ) : (
        <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
          <fieldset className="w-full grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2 items-center">
                <label htmlFor="alamat-input" className="text-sm font-medium">
                  Alamat (Desimal)
                </label>
                <input
                  id="alamat-input"
                  name="alamat"
                  placeholder="ex: 2304"
                  type="number"
                  defaultValue={Number(register[0])}
                  className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                  required
                />
              </div>
              <div className="grid gap-2 items-center">
                <label htmlFor="pengkali-input" className="text-sm font-medium">
                  Pengkali
                </label>
                <input
                  id="pengkali-input"
                  name="pengkali"
                  placeholder="ex: 0.1"
                  type="number"
                  step="any"
                  defaultValue={Number(register[1])}
                  className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="besaran-input" className="text-sm font-medium">
                Besaran
              </label>
              <input
                id="besaran-input"
                name="besaran"
                placeholder="ex: V"
                type="text"
                defaultValue={register[2]}
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="nama-input" className="text-sm font-medium">
                Nama
              </label>
              <input
                id="nama-input"
                name="nama"
                placeholder="ex: Tegangan A"
                type="text"
                defaultValue={register[3]}
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="param-input" className="text-sm font-medium">
                Param
              </label>
              <input
                id="param-input"
                name="param"
                placeholder="Param Key (tanpa spasi)"
                type="text"
                defaultValue={register[4]}
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="flex gap-4 mt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-900 dark:bg-blue-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-blue-900 dark:border-blue-600 transition-colors hover:bg-blue-800 dark:hover:bg-blue-700"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
              <Link
                to="/pengaturan/powermeter/$powermeterId"
                params={{ powermeterId }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Batalkan
              </Link>
            </div>
          </fieldset>
          {mutation.isError && (
            <Errors
              className="mt-4"
              process="ubah register"
              message={mutation.error as AxiosError}
            />
          )}
        </form>
      )}
    </CompModal>
  )
}
