import { Link, createLazyFileRoute } from '@tanstack/react-router'
import React from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient, useQuery } from 'react-query'
import { Api } from '../../../../api/internal'
import { useAuth } from '../../../../auth'
import Errors from "../../../../components/Errors"
import { Gedung, updateGedung } from '../../../../api/gedung'
import { CompModal } from '@/common'
import { Select } from '@headlessui/react'
import { getUnit, Unit as ApiUnit } from '../../../../api/unit'
import toast from 'react-hot-toast'

export const Route = createLazyFileRoute('/__auth/pengaturan/gedung/$gedungId/edit')({
  component: EditGedung
})

function EditGedung() {

  const auth = useAuth()
  const { gedungId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const gedungRepo = queryClient.getQueriesData(["gedung"])
  const gedungApiData = gedungRepo[0][1] as Api<Gedung[]>
  const gedung = gedungApiData.results.find(item => item.id == gedungId)
  const [ isSubmitting, setIsSubmitting ] = React.useState<boolean>(false)
  const mutation = useMutation({
    mutationFn: updateGedung,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })
  const { data: uData, isSuccess: uSuccess } = useQuery<Api<ApiUnit[]>, AxiosError>({
    queryKey: ['unit', auth.token],
    queryFn: getUnit,
    retry: 2
  })

  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const payload: Gedung = {
        id: gedungId,
        name: data.get("name") as string,
        unit: {
          id: data.get("unit") as string
        }
      }

    mutation.mutate({
      token: auth.token,
      data: payload
    }, {
      onSuccess: () => {
        setIsSubmitting(false)
        toast.success('Berhasil mengubah data gedung')
        navigate({ to: '/pengaturan/gedung' })
      },
      onError: (error: any) => {
        setIsSubmitting(false)
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal mengubah data gedung'
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
      title="Edit Gedung"
      closeTo="/pengaturan/gedung"
    >
      <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
        <fieldset className="w-full grid gap-4">
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="name-input" className="text-sm font-medium">
              Nama Gedung
            </label>
            <input
              id="name-input"
              name="name"
              placeholder="Masukan Nama Gedung Baru"
              type="text"
              defaultValue={gedung?.name}
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="unit-input" className="text-sm font-medium">
              Unit
            </label>
            {
              uSuccess && <Select id='unit-input' name="unit" aria-label="Unit" defaultValue={gedung?.unit?.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full">
                {
                  uData?.results.map((v: ApiUnit, i: number) => (
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
              to='/pengaturan/gedung'
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="update data gedung" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}