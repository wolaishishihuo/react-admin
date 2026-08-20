import { type RouteObject } from 'react-router-dom';

export interface MetaProps {
  key?: string;
  icon?: string;
  title?: string;
  activeMenu?: string;
  isLink?: string;
  isHide?: boolean;
  isFull?: boolean;
  isAffix?: boolean;
  auths?: string[]; // 页面按钮权限短码
  isKeepAlive?: boolean; // 默认不缓存，true 才进 keep-alive
  multiTab?: boolean; // 默认按 pathname 单实例，true 才按完整 URL 并行开多份（详情/编辑页）
}

export type RouteObjectType = Omit<RouteObject, 'children'> & {
  redirect?: string;
  meta?: MetaProps;
  children?: RouteObjectType[];
};
