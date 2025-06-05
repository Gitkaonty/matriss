import { useContext } from "react";
import FileInfosContext from "../context/SendDataToParent";

const useFileInfos = () => {
    return useContext(FileInfosContext);
}

export default useFileInfos;