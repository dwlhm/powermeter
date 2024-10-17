import { useQuery } from "react-query";
import { useAuth } from "@/auth";
import { Api } from "@/api/internal";
import {
  Link,
  Outlet,
  createLazyFileRoute,
  useParams,
} from "@tanstack/react-router";
import { AxiosError } from "axios";
import Loadings from "@/components/Loadings";
import Errors from "@/components/Errors";
import {
  BuildingOffice2Icon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Unit, getUnit } from "@/api/unit";
import { LayoutCardPanel } from "@/common";

export const Route = createLazyFileRoute("/__auth/pengaturan/unit")({
  component: PengaturanUnit,
});

function PengaturanUnit() {
  const auth = useAuth();
  const { unitId } = useParams({ strict: false });
  const { isLoading, isError, error, isSuccess, data } = useQuery<
    Api<Unit[]>,
    AxiosError
  >({
    queryKey: ["unit", auth.token],
    queryFn: getUnit,
    retry: 2,
  });
  const unit_id = data?.results.find((item) => item.id == unitId);
  if (isLoading) return <Loadings />;

  if (isError)
    return (
      <>
        <Errors
          process="mendapatkan data list unit"
          message={error}
          action={
            <Link
              className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
              to="/pengaturan/unit/baru"
            >
              Tambah Unit
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
            <Link to="/pengaturan/unit" className="text-2xl">
              Unit
            </Link>{" "}
            {unit_id && (
              <>
                <ChevronRightIcon className="w-6 h-6 inline" />{" "}
                <span className="text-blue-900 font-medium">
                  <Link
                    to="/pengaturan/unit/$unitId"
                    params={{ unitId: unitId ? unitId : "" }}
                  >
                    {unit_id.name}
                  </Link>
                </span>
              </>
            )}
          </h2>
          <Link
            to="/pengaturan/unit/baru"
            className="bg-blue-900 py-2 px-4 mb-2 mt-3 text-white rounded inline-block transition hover:bg-blue-900/90"
          >
            Tambah Unit
          </Link>
        </header>
        <main className="mt-5">
          {!unitId && <ListUnit data={data} unit_id="" />}
          <Outlet />
        </main>
      </div>
    );
}

function ListUnit(props: { data: Api<Unit[]>; unit_id: string }) {
  const unitId = props.unit_id;

  return (
    <LayoutCardPanel>
      {props.data.results.map((data, index) => {
        return (
          <Link
            key={index}
            to={`/pengaturan/unit/${data.id}`}
            params={{ unitId }}
          >
            <BuildingOffice2Icon
              className={`size-6 ${!unitId ? "text-white" : "text-white/60"}`}
            />
            <div>
              <h4 className="font-medium text-lg capitalize">{data.name}</h4>
              <p className="text-sm mt-2 text-white/80">
                <span>Kampus:</span> {data.kampus?.name}
              </p>
            </div>
          </Link>
        );
      })}
    </LayoutCardPanel>
  );
}
