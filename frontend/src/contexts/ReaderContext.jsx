import { createContext, useContext, useState, useMemo } from 'react';

const ReaderContext = createContext(null);

export function ReaderProvider({ children }) {
  const [title, setTitle] = useState('');
  const [secondTitle, setSecondTitle] = useState('');

  const value = useMemo(
    () => ({ title, setTitle, secondTitle, setSecondTitle }),
    [title, secondTitle],
  );

  return (
    <ReaderContext.Provider value={value}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReaderContext() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReaderContext must be used within a ReaderProvider');
  }
  return context;
}

export default ReaderContext;