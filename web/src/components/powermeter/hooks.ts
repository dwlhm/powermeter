import { useQuery } from "react-query";
import { RegisterItem, getRegisterByPowermeter } from "../../api/register";
import { AuthContext } from "../../auth";

export const useRegisterQuery = (auth: AuthContext, powermeterId: string): { data: RegisterItem[], isLoading: boolean } => {

    let r: RegisterItem[] = []

    const rQuery = useQuery({
        queryFn: getRegisterByPowermeter,
        queryKey: ["powermeter.register", auth.token, powermeterId],
        retry: false
    })

    if (rQuery.isSuccess) r = [...JSON.parse(rQuery.data.results.register)]

    return { data: r, isLoading: rQuery.isLoading }
}