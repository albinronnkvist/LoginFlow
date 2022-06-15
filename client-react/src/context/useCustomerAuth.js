import { useContext } from "react";
import CustomerAuthContext from "./CustomerAuthProvider";

const useCustomerAuth = () => {
  return useContext(CustomerAuthContext);
}

export default useCustomerAuth;