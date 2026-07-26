import { Link, createLazyFileRoute } from '@tanstack/react-router'
import React from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import { Api } from '../../../../api/internal'
import { Kampus, updateKampus } from '../../../../api/kampus'
import { useAuth } from '../../../../auth'
import Errors from "../../../../components/Errors"
import { CompModal } from '@/common'
import toast from 'react-hot-toast'

export const Route = createLazyFileRoute('/__auth/pengaturan/kampus/$kampusId/edit')({
  component: EditKampus
})

function EditKampus() {

  const auth = useAuth()
  const { kampusId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const kampusRepo = queryClient.getQueriesData(["kampus"])
  const kampusApiData = kampusRepo[0][1] as Api<Kampus[]>
  const kampus = kampusApiData.results.find(item => item.id == kampusId)
  const [ isSubmitting, setIsSubmitting ] = React.useState<boolean>(false)
  const mutation = useMutation({
    mutationFn: updateKampus,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })

  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
    const data = new FormData(evt.currentTarget)
    const payload: Kampus = {
      id: kampusId,
      name: data.get("name") as string
    }

    mutation.mutate({
      token: auth.token,
      data: payload
    }, {
      onSuccess: () => {
        setIsSubmitting(false)
        toast.success('Berhasil mengubah data kampus')
        navigate({ to: "/pengaturan/kampus" })
      },
      onError: (error: any) => {
        setIsSubmitting(false)
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal mengubah data kampus'
        toast.error(errorMessage)
      }
    }) 
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
      toast.error('Terjadi kesalahan yang tidak terduga')
    }
     
  }

  return(
    <CompModal
      title="Edit Kampus"
      closeTo="/pengaturan/kampus"
    >
      <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
        <fieldset className="w-full grid gap-4">
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="name-input" className="text-sm font-medium">
              Nama Kampus
            </label>
            <input
              id="name-input"
              name="name"
              placeholder="Masukan Nama Kampus Baru"
              type="text"
              defaultValue={kampus?.name}
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
              to='/pengaturan/kampus'
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="update data kampus" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}