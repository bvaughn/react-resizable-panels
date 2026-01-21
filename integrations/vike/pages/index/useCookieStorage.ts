import { useCallback, useMemo } from "react";
import { type LayoutStorage } from "react-resizable-panels";
import { usePageContext } from "vike-react/usePageContext";

export function useCookieStorage() {
  const pageContext = usePageContext();

  const cookieString = useMemo(
    () =>
      typeof document !== "undefined"
        ? document.cookie
        : (pageContext.headers?.cookie ?? ""),
    [pageContext.headers?.cookie]
  );

  const getItem = useCallback(
    (key: string) => {
      const cookies = cookieString.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === key) {
          return value;
        }
      }
      return null;
    },
    [cookieString]
  );

  const setItem = useCallback((key: string, value: string) => {
    document.cookie = `${key}=${value}; path=/`;
  }, []);

  return useMemo<LayoutStorage>(
    () => ({ getItem, setItem }),
    [getItem, setItem]
  );
}
