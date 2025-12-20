"use client";

import { ReactNode } from "react";
import { SessionWrapper } from "../../components/session/SessionWrapper";
import { Toaster } from "react-hot-toast";
import StoreProvider from "./storeProvider";
import CartHydration from "./hydration/cartHydration";


export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider>
      <CartHydration />
      <SessionWrapper>
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </SessionWrapper>
    </StoreProvider>
  );
};
