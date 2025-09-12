'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { createShootingStar } from '@/utils/createShootingStar';

export default function Home() {
  // const { userId } : { userId: string | null } = auth();
  // console.log("Test", userId);

  // let href = userId ? "/journal" : "/new-user";

  const href = '/journal';

  useEffect(() => {
    console.log('shooting star useEffect');
    createShootingStar();
  }, []);

  return (
    <div
      className="w-screen h-screen bg-no-repeat flex justify-center items-center text-white"
      style={{
        backgroundImage: 'url("/clouds.jpeg")',
        backgroundSize: 'cover',
        height: '100vh',
      }}
    >
      <div className="flex flex-col justify-center items-center px-8">
        <div className="flex flex-col justify-center items-center bg-white/60 py-10 shadow-xl rounded-xl">
          <div className="flex flex-col px-10 w-full max-w-[600px] mx-auto">
            <h1 className="flex flex-col text-6xl text-black mb-4">Dream Journal</h1>
            <p className="flex flex-col text-xl text-black mb-4">Explore your dreams!</p>
            <div className="flex flex-col">
              <Link href={href}>
                <button className="bg-pink-400 shadow-lg text-black px-4 py-2 rounded-2xl text-xl cursor-pointer border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-pink-500 hover:text-white">
                  get started
                </button>
              </Link>
            </div>
          </div>
        </div>
        {/* 
        <div className="flex flex-col">
          <h3 className="flex flex-col text-white py-2 text-md">Public Login: dreamer.public@gmail.com || testaccount00</h3>
        </div>
        */}
      </div>
    </div>
  );
}
