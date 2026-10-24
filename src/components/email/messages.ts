export type Folder = "drafts" | "inbox" | "sent" | "starred";

export type Message = {
  body: string[];
  folder: "drafts" | "inbox" | "sent";
  from: string;
  id: number;
  isStarred: boolean;
  subject: string;
  time: string;
};

export const messages: Message[] = [
  {
    body: [
      "Hi team, the design review is moving to Thursday at 2pm so that everyone can make it.",
      "Please add any mockups you'd like feedback on to the shared folder before then."
    ],
    folder: "inbox",
    from: "Maya Chen",
    id: 1,
    isStarred: true,
    subject: "Design review moved to Thursday",
    time: "9:41 AM"
  },
  {
    body: [
      "All checks passed for the latest commit on main.",
      "The preview deployment is ready to review."
    ],
    folder: "inbox",
    from: "Build Bot",
    id: 2,
    isStarred: false,
    subject: "CI passed on main",
    time: "8:15 AM"
  },
  {
    body: [
      "There's a new ramen place near the office that I've been wanting to try.",
      "Want to go on Friday? I can book a table for noon."
    ],
    folder: "inbox",
    from: "Jordan Patel",
    id: 3,
    isStarred: false,
    subject: "Lunch on Friday?",
    time: "Yesterday"
  },
  {
    body: [
      "Attached is the first draft of the Q3 roadmap.",
      "The biggest open question is whether to ship the new layout editor before or after the settings redesign. Comments welcome!"
    ],
    folder: "inbox",
    from: "Priya Raman",
    id: 4,
    isStarred: true,
    subject: "Q3 roadmap draft",
    time: "Yesterday"
  },
  {
    body: [
      "Collapsing the sidebar down to just its icons feels much better than hiding it entirely.",
      "Can we remember the size people choose between visits too?"
    ],
    folder: "inbox",
    from: "Sam Okafor",
    id: 5,
    isStarred: false,
    subject: "Re: Resizable sidebar",
    time: "Mon"
  },
  {
    body: [
      "This week: container queries in practice, a closer look at subgrid, and accessible window splitters."
    ],
    folder: "inbox",
    from: "Layout Weekly",
    id: 6,
    isStarred: false,
    subject: "This week in web layout",
    time: "Sun"
  },
  {
    body: ["Thursday works for me. I'll bring the latest sidebar mockups."],
    folder: "sent",
    from: "You",
    id: 7,
    isStarred: false,
    subject: "Re: Design review moved to Thursday",
    time: "9:52 AM"
  },
  {
    body: ["Sounds great, see you at noon!"],
    folder: "sent",
    from: "You",
    id: 8,
    isStarred: false,
    subject: "Re: Lunch on Friday?",
    time: "Yesterday"
  },
  {
    body: ["A few thoughts on the roadmap draft..."],
    folder: "drafts",
    from: "You",
    id: 9,
    isStarred: false,
    subject: "Re: Q3 roadmap draft",
    time: "Yesterday"
  }
];

export function getMessages(folder: Folder) {
  return folder === "starred"
    ? messages.filter((message) => message.isStarred)
    : messages.filter((message) => message.folder === folder);
}
