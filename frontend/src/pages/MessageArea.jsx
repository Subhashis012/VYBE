import React, { useEffect, useRef, useState } from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dp from "../assets/dp.jpg";
import { LuImage } from "react-icons/lu";
import { IoMdSend } from "react-icons/io";
import SenderMessage from "../components/SenderMessage";
import axios from "axios";
import { serverUrl } from "../App";
import { setMessages } from "../redux/messageSlice";
import ReceiverMessage from "../components/ReceiverMessage";

function MessageArea() {
  const navigate = useNavigate();
  const imageInput = useRef();
  const dispatch = useDispatch();
  const { selectedUser, messages } = useSelector((state) => state.message);
  const { userData } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.socket);
  const [input, setInput] = useState("");
  const [frontedImage, setFrontedImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontedImage(URL.createObjectURL(file));
    setInput(""); // Clear input when an image is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("message", input);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      dispatch(setMessages([...messages, result.data]));
      setInput("");
      setFrontedImage(null);
      setBackendImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getAllMessages = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/message/getAll/${selectedUser._id}`,
        { withCredentials: true }
      );
      dispatch(setMessages(result.data));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    getAllMessages();
  }, []);

  useEffect(() => {
    socket?.on("newMessage", (mess) => {
      dispatch(setMessages([...messages, mess]));
    });
    return () => {
      socket.off("newMessage");
    };
  }, [messages, setMessages]);

  return (
    <div className="w-full h-[100vh] bg-black relative">
      <div className="flex items-center gap-[15px] px-[20px] py-[10px] fixed top-0 z-[100] bg-black w-full">
        <div className=" h-[80px]  flex items-center gap-[20px] px-[20px] ">
          <MdOutlineKeyboardBackspace
            onClick={() => navigate(`/`)}
            className="text-white w-[25px] h-[25px] cursor-pointer"
          />
          {/* <h1 className="text-white text-[20px] font-semibold">Edit Profile</h1> */}
        </div>

        <div
          className="w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden"
          onClick={() => navigate(`/profile/${selectedUser?.userName}`)}
        >
          <img
            src={selectedUser?.profileImage || dp}
            alt="Profile"
            className="w-full object-cover"
          />
        </div>

        <div
          className="text-white font-semibold cursor-pointer text-[18px] "
          onClick={() => navigate(`/profile/${selectedUser?.userName}`)}
        >
          <div>{selectedUser.userName}</div>
          <div className="text-[14px] text-gray-400">{selectedUser.name}</div>
        </div>
      </div>

      <div className="w-full h-[80%] pt-[100px] px-[40px] flex flex-col gap-[50px] overflow-auto bg-black">
        {messages && messages.length > 0 ? (
          messages.map((mess, index) =>
            mess?.sender === userData?._id ? (
              <SenderMessage message={mess} key={index} />
            ) : (
              <ReceiverMessage message={mess} key={index} />
            )
          )
        ) : (
          <div className="text-white text-center text-[18px] mt-[50px]">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      <div className="w-full h-[80px] fixed bottom-0 flex justify-center items-center bg-black z-[100]">
        <form
          className="w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#131616] flex items-center gap-[10px] px-[20px] relative"
          onSubmit={handleSubmit}
        >
          {frontedImage && (
            <div className="w-[100px] rounded-2xl h-[100px] absolute top-[-120px] right-[10px] overflow-hidden">
              <img src={frontedImage} alt="" className="h-full object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imageInput}
            onChange={handleImage}
          />
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full h-full px-[20px] text-[18px] text-white outline-0"
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <div onClick={() => imageInput.current.click()}>
            <LuImage className="w-[28px] h-[28px] cursor-pointer text-white" />
          </div>
          {(input || frontedImage) && (
            <button className="w-[60px] h-[40px] rounded-full bg-gradient-to-br from-[#9500ff] to-[#ff0095] flex items-center justify-center cursor-pointer">
              <IoMdSend className="w-[25px] h-[25px] text-white" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default MessageArea;
