import {
  Link,
  MatchRoute,
  Outlet,
  createFileRoute,
} from '@tanstack/react-router'
import { useAuth } from '@/auth'
import { CompLoading, LayoutError } from '@/common'
import { PerangkatEnergyOverview, PerangkatOptions } from '@/perangkat/layouts'
import { useQueryDetailPerangkat } from '@/perangkat/hooks'
import { PerangkatSubMenu } from '@/perangkat/layouts/perangkat.sub.menu'
import { PerangkatSubHeadingPanel } from '@/perangkat/components'
import {
  ArchiveBoxIcon,
  ChartPieIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/__auth/perangkat/$perangkatId')({
  component: PreviewPerangkat,
})

function PreviewPerangkat() {
  const user = useAuth()
  const { perangkatId } = Route.useParams()

  const {
    isLoading,
    isError,
    isSuccess,
    data: dDetail,
    error: dError,
  } = useQueryDetailPerangkat(user.token, perangkatId)

  if (isLoading) return <CompLoading />

  if (isError)
    return (
      <LayoutError
        process="mendapatkan data detail perangkat"
        message={dError}
      />
    )

  if (isSuccess)
    return (
      <>
        <div className="flex justify-between gap-4 items-center sticky top-16 p-2 sm:p-6 lg:p-8 sm:pb-2 lg:pb-2 bg-white rounded-t z-10">
          <div>
            <div className="flex gap-4 items-center">
              <h2 className="font-semibold text-xl">{dDetail.results.name}</h2>
              <p
                className={`capitalize device-status ${dDetail.results.status}`}
              >
                {dDetail.results.status}
              </p>
            </div>

            <p className="text-sm">
              {dDetail.results.ip_addr} - {dDetail.results.powermeter.seri}(
              {dDetail.results.powermeter.brand})
            </p>
          </div>
          <div>
            <PerangkatOptions perangkatId={perangkatId} />
          </div>
        </div>
        <PerangkatSubHeadingPanel withoutBackBtn={true}>
          <PerangkatSubMenu>
            <>
              <Link
                to="/perangkat/$perangkatId"
                params={{ perangkatId }}
                className="transition flex gap-2 items-center p-3 px-5 border-b-2 border-transparent hover:bg-gray-200 hover:border-b-blue-500"
                activeOptions={{
                  exact: true,
                }}
                activeProps={{
                  className: 'bg-gray-200 border-b-blue-500',
                }}
              >
                <ChartPieIcon className="size-4 fill-white/20" />
                Dashboard
              </Link>
              <Link
                to="/perangkat/$perangkatId/data"
                params={{ perangkatId }}
                className="transition flex gap-2 items-center p-3 px-5 border-b-2 border-transparent hover:bg-gray-200 hover:border-b-2 hover:border-b-blue-500"
                activeProps={{
                  className: 'bg-gray-200 border-b-blue-500',
                }}
              >
                <CircleStackIcon className="size-4" />
                Data Realtime
              </Link>
              <Link
                to="/perangkat/$perangkatId/arsip"
                params={{ perangkatId }}
                className="transition flex gap-2 items-center p-3 px-5 border-b-2 border-transparent hover:bg-gray-200 hover:border-b-2 hover:border-b-blue-500"
                activeProps={{
                  className: 'bg-gray-200 border-b-blue-500',
                }}
              >
                <ArchiveBoxIcon className="size-4" />
                Arsip
              </Link>
            </>
          </PerangkatSubMenu>
        </PerangkatSubHeadingPanel>
        <Outlet />
        <MatchRoute to="/perangkat/$perangkatId">
          <PerangkatEnergyOverview
            token={user.token}
            perangkatId={perangkatId}
          />
        </MatchRoute>
      </>
    )
}
