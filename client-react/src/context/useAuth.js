import { useContext } from "react";
import AuthContext from "./AuthProvider";

// Function for using the Authentication context.
// Eg. getting or manipulating the prop value in child components.
const useAuth = () => {
  return useContext(AuthContext);
}

export default useAuth;