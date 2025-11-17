import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavStore } from "../hooks/useNavStore";

export function RouteChangeHandler() {
  const { hide } = useNavStore();

  const { pathname } = useLocation();

  useLayoutEffect(() => {
    hide();

    const main = document.body.querySelector("[data-main-scrollable]");
    if (main) {
      const timeout = setTimeout(() => {
        main.scrollTo(0, 0);
      }, 1);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [hide, pathname]);

  return null;
}
