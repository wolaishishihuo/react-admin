import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { UserAction, UserState } from "@/stores/interface";

export type UserStoreState = UserState & UserAction;

export const useUserStore = create<UserStoreState>()(
  immer(
    persist(
      set => ({
        token: "",
        refreshToken: "",
        userInfo: { name: "wolaishishihuo" },
        setToken: token =>
          set((state: UserState) => {
            state.token = token;
          }),
        setRefreshToken: refreshToken =>
          set((state: UserState) => {
            state.refreshToken = refreshToken;
          }),
        setUserInfo: userInfo =>
          set((state: UserState) => {
            state.userInfo = userInfo;
          })
      }),
      {
        name: "hooks-user",
        version: 1.0
      }
    )
  )
);
