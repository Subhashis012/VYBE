import React from "react";
import logo from "../assets/Logo.png";
import { FaRegHeart } from "react-icons/fa6";
import StoryDp from "./StoryDp";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import Post from "./Post";
import { BiMessageAltDetail } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const navigate = useNavigate();
  const { postData } = useSelector((state) => state.post);
  const { userData } = useSelector((state) => state.user);
  const { notificationData } = useSelector((state) => state.user);
  const { storyList, currentUserStory } = useSelector((state) => state.story);

  return (
    <div className="lg:w-[50%] w-full bg-black min-h-[100vh] lg:h-[100vh] relative lg:overflow-y-auto">
      <div className="w-full h-[100px] flex items-center justify-between p-[20px] lg:hidden">
        <img src={logo} alt="Logo" className="w-[80px]" />
        <div className="flex items-center gap-[10px]">
          <div className="relative" onClick={() => navigate("/notifications")}>
            <FaRegHeart className="text-white w-[25px] h-[25px] cursor-pointer" />
            {notificationData?.length > 0 &&
              notificationData.some((noti) => noti.isRead === false) && (
                <div className="w-[10px] h-[10px] bg-blue-600 rounded-full absolute top-0 right-[-5px]"></div>
              )}
          </div>
          <BiMessageAltDetail
            className="text-white w-[25px] h-[25px] cursor-pointer"
            onClick={() => navigate("/messages")}
          />
        </div>
      </div>
      <div className="flex w-full justify-start overflow-x-auto gap-[10px] items-center p-[20px]">
        <StoryDp
          userName={"Your Story"}
          ProfileImage={userData.profileImage}
          story={currentUserStory}
        />

        {storyList?.map((story, index) => (
          <StoryDp
            key={index}
            userName={story.author.userName}
            ProfileImage={story.author.profileImage}
            story={story}
          />
        ))}
      </div>
      <div className="w-full min-h-[100vh] flex flex-col items-center gap-[20px] p-[10px] pt-[40px] bg-white rounded-t-[60px] relative pb-[120px]">
        <Nav />
        {postData?.map((post, index) => (
          <Post key={index} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
