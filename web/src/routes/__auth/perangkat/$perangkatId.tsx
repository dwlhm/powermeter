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
  CodeBracketSquareIcon,
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
      <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 sm:px-6 lg:px-8 bg-card/80 backdrop-blur-xl border-b border-border rounded-tl-2xl">
          <div>
            <div className="flex gap-4 items-center">
              <h2 className="font-bold text-2xl tracking-tight text-foreground">{dDetail.results.name}</h2>
              <p
                className={`capitalize device-status ${dDetail.results.status} bg-background/50 px-3 py-1 rounded-full text-xs border border-border`}
              >
                {dDetail.results.status}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {dDetail.results.ip_addr} &bull; {dDetail.results.powermeter.seri} ({dDetail.results.powermeter.brand})
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
                className="transition-all flex gap-2 items-center p-3 px-6 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:border-b-primary/50"
                activeOptions={{
                  exact: true,
                }}
                activeProps={{
                  className: 'bg-foreground/5 border-b-primary text-primary',
                }}
              >
                <ChartPieIcon className="size-4" />
                Dashboard
              </Link>
              <Link
                to="/perangkat/$perangkatId/data"
                params={{ perangkatId }}
                className="transition-all flex gap-2 items-center p-3 px-6 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:border-b-primary/50"
                activeProps={{
                  className: 'bg-foreground/5 border-b-primary text-primary',
                }}
              >
                <CircleStackIcon className="size-4" />
                Data Realtime
              </Link>
              <Link
                to="/perangkat/$perangkatId/arsip"
                params={{ perangkatId }}
                className="transition-all flex gap-2 items-center p-3 px-6 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:border-b-primary/50"
                activeProps={{
                  className: 'bg-foreground/5 border-b-primary text-primary',
                }}
              >
                <ArchiveBoxIcon className="size-4" />
                Arsip
              </Link>
              <Link
                to="/perangkat/$perangkatId/logs"
                params={{ perangkatId }}
                className="transition-all flex gap-2 items-center p-3 px-6 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:border-b-primary/50"
                activeProps={{
                  className: 'bg-foreground/5 border-b-primary text-primary',
                }}
              >
                <CodeBracketSquareIcon className="size-4" />
                Logs
              </Link>
            </>
          </PerangkatSubMenu>
        </PerangkatSubHeadingPanel>
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
          <MatchRoute to="/perangkat/$perangkatId">
            <PerangkatEnergyOverview
              token={user.token}
              perangkatId={perangkatId}
            />
          </MatchRoute>
        </div>
      </div>
    )
}
