import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
interface Context {
  isLogged: boolean;
  setIsLogged: Dispatch<SetStateAction<boolean>>;
}
const AuthContext = React.createContext<Context>({} as Context);
const AuthProvider: React.FC = ({ children }) => {
  const [isLogged, setIsLogged] = useState(true);
  return (
    <AuthContext.Provider
      value={{
        isLogged,
        setIsLogged,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
export function useAuth() {
  return useContext(AuthContext);
}
export default AuthProvider;
