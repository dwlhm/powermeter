import { Link, createLazyFileRoute } from '@tanstack/react-router'
import React from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import { Api } from '../../../../api/internal'
import { useAuth } from '../../../../auth'
import Errors from "../../../../components/Errors"
import { Powermeter, updatePowermeter } from '../../../../api/powermeter'
import { CompModal } from '@/common'

export const Route = createLazyFileRoute('/__auth/pengaturan/powermeter/$powermeterId/edit')({
  component: EditPowermeter
})

function EditPowermeter() {

  const auth = useAuth()
  const { powermeterId } = Route.useParams<{powermeterId: string}>()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const repo = queryClient.getQueriesData(["powermeter"])
  const adpiData = repo[0][1] as Api<Powermeter[]>
  const powermeter_data = adpiData.results.find(item => item.id == powermeterId)
  const [ isSubmitting, setIsSubmitting ] = React.useState<boolean>(false)
  const mutation = useMutation({
    mutationFn: updatePowermeter,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })

  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const payload: Powermeter = {
        id: powermeterId,
        seri: data.get("seri") as string,
        brand: data.get("brand") as string,
        slave_id: parseInt(data.get("slave_id") as string || "1", 10),
        count: parseInt(data.get("count") as string || "2", 10),
        timeout: parseInt(data.get("timeout") as string || "4", 10)
      }

    mutation.mutate({
      token: auth.token,
      data: payload
    }, {
      onSuccess: () => {
        setIsSubmitting(false)
        navigate({ to: '/pengaturan/powermeter/$powermeterId', params: { powermeterId } })
      },
      onError: () => {
        setIsSubmitting(false)
      }
    }) 
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
    }
     
  }

  return(
    <CompModal
      title="Edit Powermeter"
      closeTo="/pengaturan/powermeter/$powermeterId"
      closeParams={{ powermeterId }}
    >
      <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
        <fieldset className="w-full grid gap-4">
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="seri-input" className="text-sm font-medium">
              Seri
            </label>
            <input
              id="seri-input"
              name="seri"
              placeholder="Masukan Seri Powermeter Baru"
              type="text"
              defaultValue={powermeter_data?.seri}
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="brand-input" className="text-sm font-medium">
              Brand
            </label>
            <input
              id="brand-input"
              name="brand"
              placeholder="Masukan Brand Powermeter Baru"
              type="text"
              defaultValue={powermeter_data?.brand}
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2 items-center">
              <label htmlFor="slave_id-input" className="text-sm font-medium">
                Slave ID
              </label>
              <input
                id="slave_id-input"
                name="slave_id"
                defaultValue={powermeter_data?.slave_id ?? 1}
                min={1}
                type="number"
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center">
              <label htmlFor="count-input" className="text-sm font-medium">
                Count
              </label>
              <input
                id="count-input"
                name="count"
                defaultValue={powermeter_data?.count ?? 2}
                min={1}
                type="number"
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center">
              <label htmlFor="timeout-input" className="text-sm font-medium">
                Timeout (s)
              </label>
              <input
                id="timeout-input"
                name="timeout"
                defaultValue={powermeter_data?.timeout ?? 4}
                min={1}
                type="number"
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
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
              to='/pengaturan/powermeter/$powermeterId'
              params={{ powermeterId }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="update data powermeter" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}