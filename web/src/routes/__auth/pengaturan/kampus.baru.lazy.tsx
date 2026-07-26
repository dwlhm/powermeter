import { createLazyFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import { newKampus } from '../../../api/kampus'
import { useAuth } from '../../../auth'
import Errors from '../../../components/Errors'
import { CompModal } from '@/common'
import toast from 'react-hot-toast'

export const Route = createLazyFileRoute('/__auth/pengaturan/kampus/baru')({
  component: KampusBaru
})

function KampusBaru() {
  const auth = useAuth()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: newKampus,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const kampus_name: string | undefined = data.get('name')?.toString()

      if (!kampus_name) return

      await mutation.mutate({
        token: auth.token,
        data: {
          name: kampus_name
        }
      },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          router.invalidate()
          toast.success('Berhasil menambahkan data kampus')
          navigate({ to: "/pengaturan/kampus" })
        },
        onError: (error: any) => {
          setIsSubmitting(false)
          const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal menambahkan data kampus'
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
      title="Tambah Data Kampus"
      closeTo="/pengaturan/kampus"
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
              placeholder="Masukan Nama Kampus yang Ditambahkan"
              type="text"
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
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
              to="/pengaturan/kampus"
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="tambah data kampus" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}