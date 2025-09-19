import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import Layout from "../components/layout";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";

import "../src/app/globals.css";

import "nprogress/nprogress.css";
import "../styles/third-party.css";
import "../styles/style.css";
import "react-loading-skeleton/dist/skeleton.css";
import "@contentstack/live-preview-utils/dist/main.css";
import { Props } from "../typescript/pages";
import { useState, useEffect } from "react";
import { SafeStackInfo, getStackInfo } from "../helper/get-stack-details";
import { JwtProvider } from "../components/JwtContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp(props: Props) {
  const { Component, pageProps } = props;
  const { page, posts, archivePost } = pageProps;

    const [stackData, setStackData] = useState<SafeStackInfo | null>(null);
  
    // useEffect(() => {
    //   const run = async () => {
    //     const data = await getStackInfo();
    //     if (data) {
    //       console.log("stackdata", data);
    //       setStackData(data);

    //        await fetch("/api/set-stack-info", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    //     }
    //   };
    //   run();
    // }, []);

  const metaData = (seo: any) => {
    const metaArr = [];
    for (const key in seo) {
      if (seo.enable_search_indexing) {
        metaArr.push(
          <meta
            name={
              key.includes("meta_")
                ? key.split("meta_")[1].toString()
                : key.toString()
            }
            content={seo[key].toString()}
            key={key}
          />
        );
      }
    }
    return metaArr;
  };
  const blogList: any = posts?.concat(archivePost);
  return (
    <>
      <Head>
        <meta
          name="application-name"
          content="Contentstack-Nextjs-Starter-App"
        />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1"
        />
        <meta name="theme-color" content="#317EFB" />
        <title>Contentstack</title>
        {page?.seo && page.seo.enable_search_indexing && metaData(page.seo)}
      </Head>


       {/* {stackData && (
        <>
          <h3>Stack Name from APP : {stackData.stackname}</h3>
          <h3>API Key from APP: {stackData.apiKey}</h3>
          <h3>Branch from APP: {stackData.branch}</h3>
          <h3>CMA TOKEN from APP: {stackData.cmaToken}</h3>
          <h3>Delivery Token from APP: {stackData.deliveryToken}</h3>
          <h3>Org UID from APP: {stackData.org_uid}</h3>
          <h3>Owner UID from APP: {stackData.owner_uid}</h3>
          <h3>Region from APP: {stackData.appRegion}</h3>
        </>
      )} */}
       <JwtProvider>
      <Layout page={page} blogList={blogList}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </Layout>
      </JwtProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  const header = {};
  const footer = {};
  const entries = {};

  return { ...appProps, header, footer, entries };
};

export default MyApp;
