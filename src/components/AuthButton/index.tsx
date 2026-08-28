import React from "react";

import { useAuthStore } from "@/stores";
import { getMenuByPath } from "@/utils";

type AuthButtonProps = {
  authority: string | string[];
  children: React.ReactNode;
};

const AuthButton: React.FC<AuthButtonProps> = ({ authority, children }) => {
  const authButtonList = useAuthStore(state => state.authButtonList) ?? [];

  const meta = getMenuByPath()?.meta ?? {};

  let isAuth = false;

  if (typeof authority === "string") {
    authButtonList[meta.key!]?.includes(authority) && (isAuth = true);
  }

  if (authority instanceof Array && authority.length) {
    const hasPermission = authority.every(item => authButtonList[meta.key!]?.includes(item));
    hasPermission && (isAuth = true);
  }

  return <React.Fragment>{isAuth && children}</React.Fragment>;
};

export default React.memo(AuthButton);
