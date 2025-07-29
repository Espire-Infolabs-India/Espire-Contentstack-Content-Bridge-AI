import { useEffect, useState } from 'react';
import { SafeStackInfo, getStackInfo } from './get-stack-details';


export const useStackData = () => {
  const [stackData, setStackData] = useState<SafeStackInfo | null>(null);

  useEffect(() => {
    const run = async () => {
      const data = await getStackInfo();
      if (data) {
        setStackData(data);
      }
    };
    run();
  }, []);

  return stackData;
};
