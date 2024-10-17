import { Api } from "@/api/internal";
import { Kampus as KampusInf, getKampus } from "@/api/kampus";
import { useAuth } from "@/auth";
import Errors from "@/components/Errors";
import Loadings from "@/components/Loadings";
import {
  Link,
  Outlet,
  createLazyFileRoute,
  useParams,
} from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useQuery } from "react-query";
import {
  ChevronRightIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { LayoutCardPanel } from "@/common";

export const Route = createLazyFileRoute("/__auth/pengaturan/kampus")({
  component: Kampus,
});

function Kampus() {
  const auth = useAuth();
  const { kampusId } = useParams({ strict: false });
  const { isLoading, isError, error, isSuccess, data } = useQuery<
    Api<KampusInf[]>,
    AxiosError
  >({
    queryKey: ["kampus", auth.token],
    queryFn: getKampus,
    retry: 2,
  });
  const kampus_id = data?.results.find((item) => item.id == kampusId);

  if (isLoading) return <Loadings />;

  if (isError)
    return (
      <>
        <Errors
          process="mendapatkan data list kampus"
          message={error}
          action={
            <Link
              className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
              to="/pengaturan/kampus/baru"
            >
              Tambah Kampus
            </Link>
          }
        />
        <Outlet />
      </>
    );

  if (isSuccess)
    return (
      <div>
        <header>
          <h2 className="py-1 flex gap-1 items-center">
            <Link to="/pengaturan/kampus" className="text-2xl">
              Kampus
            </Link>{" "}
            {kampus_id && (
              <>
                <ChevronRightIcon className="w-6 h-6 inline" />{" "}
                <span className="text-blue-900 font-medium">
                  <Link
                    to="/pengaturan/kampus/$kampusId"
                    params={{ kampusId: kampusId as string }}
                  >
                    {kampus_id.name}
                  </Link>
                </span>
              </>
            )}
          </h2>
          <Link
            to="/pengaturan/kampus/baru"
            className="bg-blue-900 py-2 px-4 mb-2 mt-3 text-white rounded inline-block transition hover:bg-blue-900/90"
          >
            Tambah Kampus
          </Link>
        </header>
        <main className="mt-5">
          {!kampusId && <ListKampus data={data} kampus_id="" />}
          <Outlet />
        </main>
      </div>
    );
}

function ListKampus(props: { data: Api<KampusInf[]>; kampus_id: string }) {
  return (
    <LayoutCardPanel>
      {props.data.results.map((data, index) => {
        return (
          <Link key={index} to={`/pengaturan/kampus/${data.id}`}>
            <BuildingLibraryIcon
              className={`size-6 ${!props.kampus_id ? "text-white" : "text-white/60"}`}
            />
            <h4 className="font-medium text-lg capitalize text-balance">
              {data.name}
            </h4>
          </Link>
        );
      })}
    </LayoutCardPanel>
  );
}
