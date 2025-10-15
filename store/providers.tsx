"use client";

import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "./index";
import { AuthProvider } from "@/components/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
