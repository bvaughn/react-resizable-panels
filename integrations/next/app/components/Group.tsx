"use client";

import {
  Group as GroupExternal,
  type GroupProps
} from "react-resizable-panels";

export default function Group(props: Omit<GroupProps, "onLayoutChange">) {
  return (
    <GroupExternal
      {...props}
      onLayoutChange={(layout) => {
        document.cookie = `${props.id}=${JSON.stringify(layout)}`;
      }}
    />
  );
}
