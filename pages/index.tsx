import React, { useState, useEffect } from 'react';
import { onEntryChange } from '../contentstack-sdk';
import Skeleton from 'react-loading-skeleton';
import FormDocument from '../components/form-document';

import { Props, Context } from "../typescript/pages";


export default function Home(props: Props) {
  const { page, entryUrl } = props;
  const [getEntry, setEntry] = useState(page);
  
  // async function fetchData() {
  //   try {
  //     const entryRes = await getPageRes(entryUrl);
  //     if (!entryRes) throw new Error('Status code 404');
  //     setEntry(entryRes);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // useEffect(() => {
  //   onEntryChange(() => fetchData());
  // }, []);

  return (
    <>
      <FormDocument />
    </>
  );
}

export async function getServerSideProps(context: Context) {
  try {
    // const entryRes = await getPageRes(context.resolvedUrl);
    // return {
    //   props: {
    //     entryUrl: context.resolvedUrl,
    //     page: entryRes,
    //   },
    // };
    return {
      props: {
        entryUrl: context.resolvedUrl,
        page: null,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}
