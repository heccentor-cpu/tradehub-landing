// Root page is unreachable in practice — middleware redirects `/` to `/es` or
// `/en`. This stub exists only to satisfy Next when the dev server is started
// before middleware kicks in.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/es");
}
