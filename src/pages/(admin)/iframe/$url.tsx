import { createFileRoute } from '@tanstack/react-router';
import { IframePage } from '@/components/IframePage';
import { toHttpUrl } from '@/utils/url';

function decodeIframeUrl(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function BuiltinIframePage() {
  const { url } = Route.useParams();
  const iframeUrl = toHttpUrl(decodeIframeUrl(url));
  return <IframePage title={iframeUrl} url={iframeUrl} />;
}

export const Route = createFileRoute('/(admin)/iframe/$url')({
  component: BuiltinIframePage,
  staticData: {
    title: '内嵌页面',
    keepAlive: true,
    menu: { hide: true },
    tab: { multi: true }
  }
});
