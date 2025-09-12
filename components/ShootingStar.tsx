'use client';

import { useEffect } from 'react';
import { createShootingStar } from '@/utils/createShootingStar';

function ShootingStar() {
  useEffect(() => {
    createShootingStar();
  }, []);

  return null;
}

export default ShootingStar;
