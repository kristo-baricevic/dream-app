"use client";

import { useEffect } from 'react';
import { createShootingStar } from '@/utils/createShootingStar';

function ShootingStar() {
  console.log("shooting star component mounted");
  
  useEffect(() => {
    console.log("shooting star useEffect");
    createShootingStar();
  }, []);

  return null;
}

export default ShootingStar;
