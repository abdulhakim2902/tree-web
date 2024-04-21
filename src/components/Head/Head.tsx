import NextHead from "next/head";
import Script from "next/script";
import React from "react";

export const PageHead = () => (
  <NextHead>
    <title>TREE</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
    <meta property="og:image" content="/share.jpg" />
  </NextHead>
);

const GoogleAnalytics = () => (
  <>
    <Script
      strategy="lazyOnload"
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
    />
    <Script id="ga" strategy="lazyOnload">
      {`
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());

     gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
   `}
    </Script>
  </>
);
