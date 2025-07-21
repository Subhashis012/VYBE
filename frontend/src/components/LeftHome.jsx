import React, { useState } from "react";
import logo from "../assets/Logo.png";
import dp from "../assets/dp.jpg";
import { FaRegHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import OtherUsers from "./OtherUsers";
import { useNavigate } from "react-router-dom";
import Notifications from "../pages/Notifications";

const LeftHome = () => {
  const navigate = useNavigate();
  const { userData, suggestedUsers } = useSelector((state) => state.user);
  const { notificationData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div
      className={`w-[25%] hidden lg:block h-[100vh] bg-black  border-r-2 border-gray-900 ${
        showNotifications ? "overflow-hidden" : "overflow-auto"
      }`}
    >
      <div className="w-full h-[100px] flex items-center justify-between p-[20px]">
        <img src={logo} alt="Logo" className="w-[80px]" />
        <div
          className="relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <FaRegHeart className="text-white w-[25px] h-[25px] cursor-pointer" />
          {notificationData?.length > 0 &&
            notificationData.some((noti) => noti.isRead === false) && (
              <div className="w-[10px] h-[10px] bg-blue-600 rounded-full absolute top-0 right-[-5px]"></div>
            )}
        </div>
      </div>

      {!showNotifications && (
        <>
          <div className="flex items-center w-full justify-between gap-[10px] px-[10px] border-b-2 border-b-gray-900 py-[10px]">
            <div className="flex items-center gap-[10px] ">
              <div className="w-[70px] h-[70px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
                <img
                  src={userData.profileImage || dp}
                  alt="Profile"
                  className="w-full object-cover"
                />
              </div>
              <div>
                <div className="text-white font-semibold text-[18px]">
                  {userData.userName}
                </div>
                <div className="text-gray-400 font-semibold text-[15px]">
                  {userData.name}
                </div>
              </div>
            </div>
            <div
              className="text-blue-500 font-semibold cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>

          <div className="w-full flex flex-col gap-[20px] p-[20px]">
            <h1 className="text-white text-[19px]">Suggested Users</h1>
            {suggestedUsers &&
              suggestedUsers
                .slice(0, 3)
                .map((user, index) => <OtherUsers key={index} user={user} />)}
          </div>
        </>
      )}

      {showNotifications && <Notifications />}
    </div>
  );
};

export default LeftHome;
