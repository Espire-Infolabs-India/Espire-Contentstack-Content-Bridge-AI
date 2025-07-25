import React from 'react';

export default function Layout({
  children,
}:any) {

  return (
    <>
      {/* {header ? <Header /> : ''} */}
      <main className='mainClass'>
        <>
        {/* <Sidebar /> */}
        {children}
        </>
      </main>
    </>
  );
}
