import { useDefaultLayout } from "react-resizable-panels";

// <begin>

const cookieStorage: Pick<Storage, "getItem" | "setItem"> = {
  getItem(key: string) {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === key) {
        return value;
      }
    }
    return null;
  },
  setItem(key: string, value: string) {
    document.cookie = `${key}=${value}`;
  }
};

// eslint-disable-next-line react-hooks/rules-of-hooks
useDefaultLayout({
  groupId: "group",
  storage: cookieStorage
});

// <end>

export { cookieStorage };
