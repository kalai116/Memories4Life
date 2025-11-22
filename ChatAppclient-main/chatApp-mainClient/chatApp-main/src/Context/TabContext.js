import React, { createContext, useState } from 'react';

export const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [isTabVisible, setIsTabVisible] = useState('none');
  return (
    <TabContext.Provider value={{ isTabVisible, setIsTabVisible }}>
      {children}
    </TabContext.Provider>
  );
};
