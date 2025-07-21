import React from "react";
import { useSelector } from "react-redux";
import dp from "../assets/dp.jpg";
import { useNavigate } from "react-router-dom";
import FollowButton from "./FollowButton";

const OtherUsers = ({ user }) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="w-full h-[80px] flex items-center justify-between border-b-2 border-gray-800">
      <div className="flex items-center gap-[10px] ">
        <div
          className="w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden"
          onClick={() => navigate(`/profile/${user.userName}`)}
        >
          <img
            src={user.profileImage || dp}
            alt="Profile"
            className="w-full object-cover"
          />
        </div>
        <div>
          <div
            className="text-white font-semibold text-[18px] cursor-pointer"
            onClick={() => navigate(`/profile/${user.userName}`)}
          >
            {user.userName}
          </div>
          <div className="text-gray-400 font-semibold text-[15px]">
            {user.name}
          </div>
        </div>
      </div>
      
      <FollowButton targetUserId={user._id} tailwind={"px-[10px] w-[100px] py-[5px] h-[40px] bg-white rounded-2xl cursor-pointer"}/>
    </div>
  );
};

export default OtherUsers;
