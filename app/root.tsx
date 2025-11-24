import { json, type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { useEffect, useState, type ReactNode } from "react";
import appStylesHref from "~/styles/tailwind.css";
import reactFlowStyles from "reactflow/dist/style.css";
import { ToastProvider } from "~/components/common/Toaster";
import { Navbar } from "~/components/common/Navbar";
import { getLocale, getTranslations } from "~/lib/i18n.server";
import { i18nextClient } from "~/i18n/i18next";
import { getQueryClient } from "~/lib/query-client";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
  { rel: "stylesheet", href: reactFlowStyles },
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com"
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
  }
];

export const meta: MetaFunction = () => [
  { charSet: "utf-8" },
  { title: "FlowForge · Visual Workflow Automation Engine" },
  {
    name: "description",
    content:
      "FlowForge is a production-ready visual workflow builder with real-time execution monitoring, built on Remix, Prisma, React Flow, and Effect."
  },
  { name: "viewport", content: "width=device-width,initial-scale=1" }
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await getLocale(request);
  const translations = await getTranslations(locale);
  const env = {
    DEMO_MODE: process.env.FLOWFORGE_DEMO_MODE ?? "true",
    WS_PORT: process.env.FLOWFORGE_WS_PORT ?? "4455"
  };

  return json({
    locale,
    translations,
    env
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang={data.locale} className="bg-midnight text-slate-100">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="antialiased">
        <Providers locale={data.locale} translations={data.translations}>
          <Navbar />
          <main className="pb-16">
            <Outlet />
          </main>
        </Providers>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />

        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.env)};`
          }}
        />
      </body>
    </html>
  );
}

function Providers({
  children,
  locale,
  translations
}: {
  children: ReactNode;
  locale: string;
  translations: Record<string, Record<string, unknown>>;
}) {
  const [queryClient] = useState(() => getQueryClient());
  const [client] = useState(() => {
    const instance = i18nextClient.cloneInstance();
    applyTranslations(instance, locale, translations);
    instance.changeLanguage(locale);
    return instance;
  });

  useEffect(() => {
    applyTranslations(client, locale, translations);
    client.changeLanguage(locale);
  }, [client, locale, translations]);

  return (
    <I18nextProvider i18n={client}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

function applyTranslations(
  instance: typeof i18nextClient,
  locale: string,
  translations: Record<string, Record<string, unknown>>
) {
  Object.entries(translations ?? {}).forEach(([namespace, resource]) => {
    if (resource) {
      instance.addResourceBundle(locale, namespace, resource, true, true);
    }
  });
}
