import type { Layout } from "react-resizable-panels";
import ClientComponent from "./ClientComponent";

const groupId = "";

declare function cookies(): {
  get(key: string): { value: string } | undefined;
};

// <begin>

export default async function Page() {
  const api = await cookies();
  const defaultLayoutString = api.get(groupId)?.value;
  const defaultLayout = defaultLayoutString
    ? (JSON.parse(defaultLayoutString) as Layout)
    : undefined;

  return <ClientComponent defaultLayout={defaultLayout} groupId={groupId} />;
}
