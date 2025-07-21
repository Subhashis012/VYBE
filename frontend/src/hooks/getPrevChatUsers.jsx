// components/GetPrevChatUsers.jsx
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPrevChatUsers } from "../redux/messageSlice";
import { serverUrl } from "../App";

function GetPrevChatUsers() {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.message);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/message/prevChats`, {
          withCredentials: true,
        });
        dispatch(setPrevChatUsers(result.data));
      } catch (error) {
        console.log("Error fetching current user:", error);
      }
    };

    fetchUser();
  }, [messages]);

  return null; // no UI
}

export default GetPrevChatUsers;
