import { useState } from 'react';
import { Skeleton } from 'antd';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { useRoute } from '@/router/use-route';
import { toHttpUrl } from '@/utils/url';
import './index.less';

interface IframePageProps {
  title?: string | null;
  url?: string | null;
}

export function IframePage(props: IframePageProps) {
  const { title = '内嵌页面', url } = props;
  const iframeUrl = toHttpUrl(url);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  if (!iframeUrl) return null;

  const src = iframeUrl;
  const iframeTitle = title || '内嵌页面';
  const loading = loadedUrl !== src;

  function handleLoad() {
    setLoadedUrl(src);
  }

  return (
    <div className='app-iframe relative'>
      {loading && <Skeleton active className='p-16px' />}
      <div className={loading ? 'h-0 overflow-hidden' : 'h-full'}>
        <iframe
          className='border-0 size-full'
          sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts'
          src={src}
          title={iframeTitle}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}

/** 固定地址内嵌页：读菜单 iframe 或 staticData.url */
export function IframeRoutePage() {
  const route = useRoute();
  const { pathMap } = useAuthorizedNavigation();
  const menuItem = pathMap.get(route.originPath);
  const url = toHttpUrl(menuItem?.iframe) ?? toHttpUrl(route.staticData.url);
  const title = menuItem?.title ?? route.staticData.title;

  return <IframePage title={title} url={url} />;
}
