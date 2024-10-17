import { Api } from "@/api/internal";
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
import { ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline";
import { Powermeter, getPowermeter } from "@/api/powermeter";
import { LayoutCardPanel } from "@/common";

export const Route = createLazyFileRoute("/__auth/pengaturan/powermeter")({
  component: PengaturanPowermeter,
});

function PengaturanPowermeter() {
  const auth = useAuth();
  const { powermeterId } = useParams({ strict: false });
  const { isLoading, isError, error, isSuccess, data } = useQuery<
    Api<Powermeter[]>,
    AxiosError
  >({
    queryKey: ["powermeter", auth.token],
    queryFn: getPowermeter,
    retry: 2,
  });
  const powermeter_data = data?.results.find((item) => item.id == powermeterId);

  if (isLoading) return <Loadings />;

  if (isError)
    return (
      <>
        <Errors
          process="mendapatkan data list powermeter"
          message={error}
          action={
            <Link
              className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
              to="/pengaturan/powermeter/baru"
            >
              Tambah Powermeter
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
            <Link to="/pengaturan/powermeter" className="text-2xl">
              Powermeter
            </Link>{" "}
            {powermeter_data && (
              <>
                <ChevronRightIcon className="w-6 h-6 inline" />{" "}
                <span className="text-blue-900 font-medium">
                  <Link
                    to="/pengaturan/powermeter/$powermeterId"
                    params={{ powermeterId: powermeterId as string }}
                  >
                    {powermeter_data.seri}
                  </Link>
                </span>
              </>
            )}
          </h2>
          <Link
            to="/pengaturan/powermeter/baru"
            className="bg-blue-900 py-2 px-4 mb-2 mt-3 text-white rounded inline-block transition hover:bg-blue-900/90"
          >
            Tambah Powermeter
          </Link>
        </header>
        <main className="mt-5">
          {!powermeterId && <ListPowermeter data={data} />}
          <Outlet />
        </main>
      </div>
    );
}

function ListPowermeter(props: { data: Api<Powermeter[]> }) {
  return (
    <LayoutCardPanel>
      {props.data.results.map((data, index) => {
        const powermeterId = data.id as string;

        return (
          <Link
            key={index}
            to="/pengaturan/powermeter/$powermeterId"
            params={{ powermeterId }}
          >
            <CubeIcon className={`size-6 text-white`} />
            <div>
              <h4 className="font-medium text-lg capitalize">{data.seri}</h4>
              <p className="text-sm text-white/80">
                <span>Brand:</span> {data.brand}
              </p>
            </div>
          </Link>
        );
      })}
    </LayoutCardPanel>
  );
}
