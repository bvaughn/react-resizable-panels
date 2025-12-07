import { cookies } from "next/headers";
import Groups from "./GroupClient";
import { Layout } from "react-resizable-panels";

export default async function Home() {
  const api = await cookies();
  const defaultLayoutString = api.get("group-one-layout")?.value;
  const defaultLayout = defaultLayoutString
    ? (JSON.parse(defaultLayoutString) as Layout)
    : undefined;

  return (
    <div className="p-2 flex flex-col gap-2">
      <Groups defaultLayout={defaultLayout} />
    </div>
  );
}
