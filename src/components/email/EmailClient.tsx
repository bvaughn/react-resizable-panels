import {
  DocumentIcon,
  InboxIcon,
  PaperAirplaneIcon,
  StarIcon
} from "@heroicons/react/16/solid";
import { type ComponentType, type SVGProps, useState } from "react";
import { cn } from "react-lib-tools";
import { Panel } from "react-resizable-panels";
import { Group } from "../styled-panels/Group";
import { Avatar } from "./Avatar";
import { type Folder, getMessages } from "./messages";

const FOLDERS: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  folder: Folder;
  title: string;
}[] = [
  { Icon: InboxIcon, folder: "inbox", title: "Inbox" },
  { Icon: StarIcon, folder: "starred", title: "Starred" },
  { Icon: PaperAirplaneIcon, folder: "sent", title: "Sent" },
  { Icon: DocumentIcon, folder: "drafts", title: "Drafts" }
];

const PANEL_CLASS_NAME = "bg-ink/8 rounded-md";

export function EmailClient() {
  const [folder, setFolder] = useState<Folder>("inbox");
  const [selectedId, setSelectedId] = useState<number | undefined>(1);

  const folderMessages = getMessages(folder);
  const selected = folderMessages.find(({ id }) => id === selectedId);

  return (
    <Group className="h-96!">
      <Panel
        className={cn(PANEL_CLASS_NAME, "p-1")}
        defaultSize={150}
        maxSize={250}
        minSize={100}
      >
        <div className="flex flex-col gap-0.5">
          {FOLDERS.map(({ Icon, folder: value, title }) => (
            <button
              className={cn(
                "flex flex-row items-center gap-2 px-2 py-1 rounded text-sm text-left cursor-pointer",
                folder === value
                  ? "bg-ink/10 text-ink"
                  : "text-ink/80 hover:bg-ink/5"
              )}
              key={value}
              onClick={() => {
                setFolder(value);
                setSelectedId(getMessages(value)[0]?.id);
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate grow">{title}</span>
              <span className="text-xs text-ink/60">
                {getMessages(value).length}
              </span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel minSize={200}>
        <Group orientation="vertical">
          <Panel
            className={cn(PANEL_CLASS_NAME, "@container")}
            defaultSize="40%"
            minSize={60}
          >
            {folderMessages.map((message) => (
              // Narrow panels show each message on two lines (sender and time, then subject)
              <button
                className={cn(
                  "w-full flex flex-col @min-[24rem]:flex-row @min-[24rem]:items-center gap-x-2 px-2 py-1 text-sm text-left cursor-pointer",
                  message.id === selectedId ? "bg-ink/10" : "hover:bg-ink/5"
                )}
                key={message.id}
                onClick={() => setSelectedId(message.id)}
              >
                <span className="flex flex-row items-center gap-2 @min-[24rem]:contents">
                  <span className="grow @min-[24rem]:grow-0 @min-[24rem]:w-28 shrink-0 truncate font-semibold">
                    {message.from}
                  </span>
                  <span className="shrink-0 text-xs text-ink/60 @min-[24rem]:order-last">
                    {message.time}
                  </span>
                </span>
                <span className="grow truncate text-ink/80">
                  {message.subject}
                </span>
              </button>
            ))}
          </Panel>
          <Panel className={cn(PANEL_CLASS_NAME, "p-3")} minSize={60}>
            {selected ? (
              <div className="flex flex-col gap-3">
                <div className="text-lg font-semibold">{selected.subject}</div>
                <div className="flex flex-row items-center gap-2">
                  <Avatar name={selected.from} />
                  <div className="grow truncate">{selected.from}</div>
                  <div className="shrink-0 text-xs text-ink/60">
                    {selected.time}
                  </div>
                </div>
                {selected.body.map((paragraph, index) => (
                  <p className="text-sm text-ink/80" key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-ink/60">
                No message selected
              </div>
            )}
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
}
