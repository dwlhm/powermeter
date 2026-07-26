import { createLazyFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAuth } from '../../../../auth'
import Errors from '../../../../components/Errors'
import { Api } from '../../../../api/internal'
import { newUnit } from '../../../../api/unit'
import { getKampus, Kampus } from '../../../..//api/kampus'
import { Select } from '@headlessui/react'
import { CompModal } from '@/common'
import toast from 'react-hot-toast'

export const Route = createLazyFileRoute('/__auth/pengaturan/unit/baru')({
  component: UnitBaru
})

function UnitBaru() {
  const auth = useAuth()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: newUnit,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })
  const { data: kData, isSuccess: kSuccess } = useQuery<Api<Kampus[]>, AxiosError>({
    queryKey: ['kampus', auth.token],
    queryFn: getKampus,
    retry: false
  })

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const unit_name = data.get('name')?.toString() as string
      const unit_id = data.get('kampus')?.toString() as string

      if (!unit_name) return

      await mutation.mutate({
        token: auth.token,
        data: {
          name: unit_name,
          kampus: {
            id: unit_id
          }
        }
      },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          router.invalidate()
          toast.success('Berhasil menambahkan data unit')
          navigate({ to: "/pengaturan/unit" })
        },
        onError: (error: any) => {
          setIsSubmitting(false)
          const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal menambahkan data unit'
          toast.error(errorMessage)
        }
      })

    } catch (error) {
      setIsSubmitting(false)
      toast.error('Terjadi kesalahan yang tidak terduga')
    }
  }

  return(
    <CompModal
      title="Tambah Data Unit"
      closeTo="/pengaturan/unit"
    >
      <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
        <fieldset className="w-full grid gap-4">
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="name-input" className="text-sm font-medium">
              Nama Unit
            </label>
            <input
              id="name-input"
              name="name"
              placeholder="Masukan Nama Unit yang Ditambahkan"
              type="text"
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="kampus-input" className="text-sm font-medium">
              Kampus
            </label>
            {
              kSuccess && <Select id='kampus-input' name="kampus" aria-label="Kampus" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full">
                {
                  kData?.results.map((v: Kampus, i: number) => (
                    <option value={v.id} key={`data-unit_${i}`}>{v.name}</option>
                  ))
                }
                </Select>
            }
          </div>
          <div className='flex gap-4 mt-5'>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-900 dark:bg-blue-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-blue-900 dark:border-blue-600 transition-colors hover:bg-blue-800 dark:hover:bg-blue-700"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
            <Link
              to="/pengaturan/unit"
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="tambah data unit" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}