import React, { useEffect, useState } from "react";
import dp from "../assets/dp.jpg";
import { useSelector } from "react-redux";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import { FaEye } from "react-icons/fa6";

function StoryCard() {
  const navigate = useNavigate();
  const { storyData } = useSelector((state) => state.story);
  const { userData } = useSelector((state) => state.user);
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          navigate("/");
          return 100;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [navigate]);

  const leftPositions = ["left-0", "left-[12px]", "left-[24px]"];
  return (
    <div className="w-full max-w-[500px] h-[100vh] border-x-2 border-gray-800 pt-[10px] relative flex flex-col justify-center">
      <div className="flex items-center gap-[10px] absolute top-[30px] px-[10px]">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(`/`)}
          className="text-white w-[25px] h-[25px] cursor-pointer"
        />
        <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
          <img
            src={storyData?.author?.profileImage || dp}
            alt="Profile"
            className="w-full object-cover"
          />
        </div>
        <div className="w-[120px] text-white font-semibold truncate">
          {storyData?.author?.userName}
        </div>
      </div>

      <div className="absolute top-[10px] w-full h-[5px] bg-gray-900">
        <div
          className="w-[200px] h-full bg-white transition-all duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {!showViewers && (
        <>
          <div className="w-full h-[90vh] flex items-center justify-center ">
            {storyData.mediaType === "image" && (
              <div className="w-[90%] flex  items-center justify-center ">
                <img
                  src={storyData.media}
                  alt=""
                  className="w-[80%] rounded-2xl  object-cover"
                />
              </div>
            )}

            {storyData.mediaType === "video" && (
              <div className="w-[80%] flex flex-col items-center justify-center ">
                <VideoPlayer media={storyData.media} />
              </div>
            )}
          </div>

          {storyData?.author?.userName == userData?.userName && (
            <div className="absolute w-full flex cursor-pointer items-center gap-[10px] h-[70px] bottom-0 p-2 left-0" onClick={() => setShowViewers(true)}>
              <div className="text-white flex items-center gap-[5px]">
                <FaEye />
                {storyData.viewers.length}
              </div>
              <div className="flex relative w-[40px] h-[40px]">
                {storyData?.viewers?.slice(0, 3).map((viewer, index) => (
                  <div
                    key={index}
                    className={`w-[30px] h-[30px] border-2 border-black rounded-full cursor-pointer overflow-hidden absolute ${leftPositions[index]}`}
                  >
                    <img
                      src={viewer?.profileImage || dp}
                      alt="Profile"
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showViewers && (
        <>
          <div className="w-full h-[30%] cursor-pointer flex items-center justify-center mt-[100px] py-[30px] overflow-hidden" onClick={() => setShowViewers(false)}>
            {storyData.mediaType === "image" && (
              <div className="h-full flex  items-center justify-center ">
                <img
                  src={storyData.media}
                  alt=""
                  className="h-[80%] rounded-2xl  object-cover"
                />
              </div>
            )}

            {storyData.mediaType === "video" && (
              <div className="h-full flex flex-col items-center justify-center ">
                <VideoPlayer media={storyData.media} />
              </div>
            )}
          </div>

          <div className="w-full h-[70%] border-t-2 border-t-gray-800 p-[20px]">
            <div className="text-white flex items-center gap-[10px] ">
              <FaEye />
              <span>{storyData?.viewers?.length}</span>
              <span>Viewers</span>
            </div>
            <div className="w-full max-h-full flex flex-col gap-[10px] overflow-auto pt-[20px]">
              {storyData?.viewers?.map((viewer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[20px] w-full"
                >
                  <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
                    <img
                      src={viewer?.profileImage || dp}
                      alt="Profile"
                      className="w-full object-cover"
                    />
                  </div>
                  <div className="w-[120px] text-white font-semibold truncate">
                    {viewer?.userName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StoryCard;
