import { createLazyFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AxiosError, AxiosResponse } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../../../../auth'
import Errors from '../../../../components/Errors'
import { Api } from '../../../../api/internal'
import { newPowermeter, Powermeter } from '../../../../api/powermeter'
import { CompModal } from '@/common'

export const Route = createLazyFileRoute('/__auth/pengaturan/powermeter/baru')({
  component: PowermeterBaru
})

function PowermeterBaru() {
  const auth = useAuth()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: newPowermeter,
    onSettled: () => {
      queryClient.invalidateQueries()
    }
  })

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const powermeter_seri: string | undefined = data.get('seri')?.toString()
      const powermeter_brand: string | undefined = data.get('brand')?.toString()
      const powermeter_slave_id: number = parseInt(data.get('slave_id')?.toString() || '1', 10)
      const powermeter_count: number = parseInt(data.get('count')?.toString() || '2', 10)
      const powermeter_timeout: number = parseInt(data.get('timeout')?.toString() || '4', 10)

      if (!powermeter_seri || !powermeter_brand) return

      await mutation.mutate({
        token: auth.token,
        data: {
          seri: powermeter_seri,
          brand: powermeter_brand,
          slave_id: powermeter_slave_id,
          count: powermeter_count,
          timeout: powermeter_timeout
        }
      },
      {
        onSuccess: (res: AxiosResponse<Api<Powermeter>, any>) => {
          const powermeterId = res.data.results.id as string
          setIsSubmitting(false)
          router.invalidate()
          navigate({ to: '/pengaturan/powermeter/$powermeterId', params: { powermeterId } })
        }
      })

    } catch (error) {
      setIsSubmitting(false)
    }
  }

  return(
    <CompModal
      title="Tambah Data Powermeter"
      closeTo="/pengaturan/powermeter"
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
              placeholder="Masukan Seri Powermeter yang Ditambahkan"
              type="text"
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
              placeholder="Masukan Brand Powermeter yang Ditambahkan"
              type="text"
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
                defaultValue={1}
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
                defaultValue={2}
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
                defaultValue={4}
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
              to='/pengaturan/powermeter'
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors className="mt-4" process="tambah data powermeter" message={mutation.error as AxiosError} />
        )}
      </form>
    </CompModal>
  )
}