import React, { useEffect, useRef, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import dp from "../assets/dp.jpg";
import FollowButton from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineComment } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { setPostData } from "../redux/postSlice";
import { setLoopData } from "../redux/loopSlice";
import { IoSendSharp } from "react-icons/io5";

function LoopCard({ loop }) {
  const videoRef = useRef();
  const commentRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const { loopData } = useSelector((state) => state.loop);
  const { socket } = useSelector((state) => state.socket);
  const [isPlaying, setIsPlaying] = useState(true);
  const [message, setMessage] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    }
  };

  const handleLike = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/loop/like/${loop._id}`, {
        withCredentials: true,
      });
      const updatedLoop = result.data;

      const updatedLoops = loopData.map((l) =>
        l._id === loop._id ? updatedLoop : l
      );
      dispatch(setLoopData(updatedLoops));
    } catch (error) {
      console.error("Error liking loop:", error);
    }
  };

  const handleLikeOnDoubleClick = () => {
    setShowHeart(true);
    setTimeout(() => {
      setShowHeart(false);
    }, 1000);
    {
      !loop.likes?.includes(userData._id) && handleLike();
    }
  };

  const handleComment = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/loop/comment/${loop._id}`,
        { message },
        { withCredentials: true }
      );
      const updatedLoop = result.data;

      const updatedLoops = loopData.map((p) =>
        p._id === loop._id ? updatedLoop : p
      );
      dispatch(setLoopData(updatedLoops));
      setMessage("");
    } catch (error) {
      console.error("Error commenting on loop:", error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return; // 👈 prevents error if ref is not yet assigned

        if (entry.isIntersecting) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    const currentVideo = videoRef.current;
    if (currentVideo) observer.observe(currentVideo);

    return () => {
      if (currentVideo) observer.unobserve(currentVideo);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setShowComment(false);
      }
    };

    if (showComment) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showComment]);


  useEffect(()=> {
      socket?.on("likedLoop",(updatedData)=> {
        const updatedLoops = loopData.map((p) =>
          p._id === updatedData.loopId ? { ...p, likes: updatedData.likes } : p
        );
        dispatch(setLoopData(updatedLoops));
      })

      socket?.on("commentedLoop",(updatedData)=> {
        const updatedLoops = loopData.map((p) =>
          p._id === updatedData.loopId ? { ...p, comments: updatedData.comments } : p
        );
        dispatch(setLoopData(updatedLoops));
      })
  
      return () => {
        socket?.off("likedLoop");
        socket?.off("commentedLoop");
      }
    },[socket, loopData, dispatch]);

  return (
    <div className="w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden">
      {showHeart && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50] heart-animation">
          <GoHeartFill className="text-white w-[100px] h-[100px] drop-shadow-2xl" />
        </div>
      )}

      <div
        ref={commentRef}
        className={`absolute z-[200] bottom-0 w-full h-[500px] p-[10px] transition-transform duration-500 ease-in-out rounded-t-4xl bg-[#0e1718]  left-0 shadow-2xl shadow-black ${
          showComment ? "translate-y-0" : "translate-y-[100%]"
        }`}
      >
        <h1 className="text-white font-semibold text-[20px] text-center">
          Comments
        </h1>

        <div className="w-full h-[350px] overflow-y-auto flex flex-col gap-[20px]">
          {loop.comments.length === 0 && (
            <div className="text-center text-white text-[20px] font-semibold mt-[50px]">
              No Comments Yet
            </div>
          )}

          {loop.comments.map((com, index) => (
            <div className="w-full flex flex-col gap-[5px] border-b-[1px] border-gray-800 justify-center pb-[10px]mt-[10px]">
              <div className="flex items-center md:gap-[20px] gap-[10px] justify-start">
                <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
                  <img
                    src={com.author?.profileImage || dp}
                    alt="Profile"
                    className="w-full object-cover"
                  />
                </div>
                <div className="w-[150px] font-semibold text-white truncate">
                  {com.author?.userName}
                </div>
              </div>
              <div className="text-white pl-[60px]">{com.message}</div>
            </div>
          ))}
        </div>

        <div className="w-full fixed py-[20px] bottom-0 h-[80px] flex items-center justify-between px-[20px]">
          <div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
            <img
              src={loop.author?.profileImage || dp}
              alt="Profile"
              className="w-full object-cover"
            />
          </div>
          <input
            type="text"
            className="px-[10px] border-b-2 text-white placeholder:text-white border-b-gray-500 w-[90%] outline-none h-[40px]"
            placeholder="Write Comment..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          {message && (
            <button
              className="absolute right-[20px] cursor-pointer"
              onClick={handleComment}
            >
              <IoSendSharp className="w-[25px] h-[25px] text-white" />
            </button>
          )}
        </div>
      </div>

      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        src={loop?.media}
        className="w-full max-h-full"
        onClick={handleClick}
        onTimeUpdate={handleTimeUpdate}
        onDoubleClick={handleLikeOnDoubleClick}
      />
      <div
        className="absolute z-[100] top-[20px] right-[20px]"
        onClick={() => setIsMuted((prev) => !prev)}
      >
        {!isMuted ? (
          <FiVolume2 className="w-[20px] h-[20px] text-white font-semibold" />
        ) : (
          <FiVolumeX className="w-[20px] h-[20px] text-white font-semibold" />
        )}
      </div>
      <div className="absolute bottom-0 w-full h-[5px] bg-gray-900">
        <div
          className="w-[200px] h-full bg-white transition-all duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="w-full absolute h-[100px] bottom-[10px] p-[10px] flex flex-col gap-[10px]">
        <div className="flex items-center  gap-[5px] ">
          <div
            className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden"
            onClick={() => navigate(`/profile/${loop.author?._id}`)}
          >
            <img
              src={loop.author?.profileImage || dp}
              alt="Profile"
              className="w-full object-cover"
            />
          </div>
          <div className="w-[120px] text-white font-semibold truncate">
            {loop.author?.userName}
          </div>
          <FollowButton
            targetUserId={loop.author?.id}
            tailwind={
              "px-[10px] py-[5px] text-white border-2 border-white text-[14px] rounded-2xl"
            }
          />
        </div>
        <div className="text-white mt-[10px] text-[14px]">{loop.caption}</div>

        <div className="absolute right-0 flex flex-col gap-[20px] text-white bottom-[150px] justify-center px-[10px]">
          <div className="flex flex-col items-center cursor-pointer">
            <div>
              {!loop.likes.includes(userData._id) && (
                <GoHeart
                  className="w-[25px] cursor-pointer h-[25px]"
                  onClick={handleLike}
                />
              )}
              {loop.likes.includes(userData._id) && (
                <GoHeartFill
                  color="red"
                  className="w-[25px] h-[25px] cursor-pointer"
                  onClick={handleLike}
                />
              )}
            </div>
            <div>{loop.likes.length}</div>
          </div>
          <div
            className="flex flex-col items-center"
            onClick={() => setShowComment(true)}
          >
            <div>
              <MdOutlineComment className="w-[25px] h-[25px] cursor-pointer" />
            </div>
            <div>{loop.comments.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoopCard;
