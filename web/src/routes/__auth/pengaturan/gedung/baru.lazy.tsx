import { createLazyFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAuth } from '../../../../auth'
import Errors from '../../../../components/Errors'
import { Api } from '../../../../api/internal'
import { newGedung } from '../../../../api/gedung'
import { getUnit, Unit } from '../../../../api/unit'
import { Select } from '@headlessui/react'
import { CompModal } from '@/common'
import toast from 'react-hot-toast'

export const Route = createLazyFileRoute('/__auth/pengaturan/gedung/baru')({
  component: GedungBaru
})

function GedungBaru() {
  const auth = useAuth()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: newGedung,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })
  const { data: uData, isSuccess: uSuccess } = useQuery<Api<Unit[]>, AxiosError>({
    queryKey: ['unit', auth.token],
    queryFn: getUnit,
    retry: 2
  })

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const gedung_name = data.get('name')?.toString() as string
      const unit_id = data.get('unit')?.toString() as string

      if (!gedung_name) return

      await mutation.mutate({
        token: auth.token,
        data: {
          name: gedung_name,
          unit: {
            id: unit_id
          }
        }
      },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          router.invalidate()
          toast.success('Berhasil menambahkan data gedung')
          navigate({ to: '/pengaturan/gedung' })
        },
        onError: (error: any) => {
          setIsSubmitting(false)
          const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal menambahkan data gedung'
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
      title="Tambah Data Gedung"
      closeTo="/pengaturan/gedung"
    >
      <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
        <fieldset className="w-full grid gap-4">
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="name-input" className="text-sm font-medium">
              Nama
            </label>
            <input
              id="name-input"
              name="name"
              placeholder="Masukan Nama Gedung yang Ditambahkan"
              type="text"
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="unit-input" className="text-sm font-medium">
              Unit
            </label>
            {
              uSuccess && <Select id='unit-input' name="unit" aria-label="Unit" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full">
                {
                  uData?.results.map((v: Unit, i: number) => (
                    <option value={v.id} key={`data-unit_${i}`}>{v.name} - {v?.kampus?.name}</option>
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
              to="/pengaturan/gedung"
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="tambah data gedung" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}