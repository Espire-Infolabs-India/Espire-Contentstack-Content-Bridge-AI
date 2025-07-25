import React, { useState, useEffect } from 'react';
import {getHeaderResponse } from '../helper';

import Navigation from '../components/navigation';
import { HeaderEntryResponse } from '../typescript/header'

export default function Header() {
  const [headerData, setHeaderData] = useState<HeaderEntryResponse | null>(null);
  async function fetchAPI() {
    try {
      //const datavalue = await getHeaderResponse("header-netgear", "blt089202a57be3cd68");
      //setHeaderData(datavalue);
      
      setHeaderData(null);

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    //fetchAPI();
  }, []);

  return (
    <header className='header'>
      {headerData && <Navigation {...headerData} /> }
    </header>
  );
}