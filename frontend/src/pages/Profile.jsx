import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setProfileData, setUserData } from "../redux/userSlice";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import dp from "../assets/dp.jpg";
import Nav from "../components/Nav";
import FollowButton from "../components/FollowButton";
import Post from "../components/Post";
import { setSelectedUser } from "../redux/messageSlice";

function Profile() {
  const dispatch = useDispatch();
  const { profileData, userData } = useSelector((state) => state.user);
  const { postData } = useSelector((state) => state.post);
  const { userName } = useParams();
  const navigate = useNavigate();

  const [postType, setPostType] = useState("posts");

  const handleProfile = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/getProfile/${userName}`,
        { withCredentials: true }
      );
      dispatch(setProfileData(result.data));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

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
  const leftPositions = ["left-0", "left-[12px]", "left-[24px]"];

  useEffect(() => {
    handleProfile();
  }, [userName, dispatch]);
  return (
    <div className="w-full min-h-screen bg-black">
      <div className="w-full h-[80px] flex items-center justify-between px-[30px] text-white ">
        <div onClick={() => navigate("/")}>
          <MdOutlineKeyboardBackspace className="text-white w-[25px] h-[25px] cursor-pointer" />
        </div>
        <div className="font-semibold text-[20px]">{profileData?.userName}</div>
        <div
          className="text-blue-500 cursor-pointer font-semibold text-[20px]"
          onClick={handleLogout}
        >
          Log Out
        </div>
      </div>

      <div className="w-full h-[150px] flex items-start gap-[20px] lg:gap-[50px] pt-[20px] px-[10px] justify-center">
        <div className="w-[80px] h-[80px] md:w-[140px] md:h-[140px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
          <img
            src={profileData?.profileImage || dp}
            alt="Profile"
            className="w-full object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-[22px] text-white">
            {profileData?.name}
          </div>
          <div className="text-[17px] text-[#ffffffe8]">
            {profileData?.profession || "New User"}
          </div>
          <div className="text-[17px] text-[#ffffffe8]">{profileData?.bio}</div>
          <div className="text-[17px] text-[#ffffffe8]">
            {profileData?.gender || "Not Specified"}
          </div>
        </div>
      </div>

      <div className="w-full h-[100px] flex items-center justify-center gap-[40px] md:gap-[60px] px-[20%] pt-[30px]">
        <div>
          <div className="text-white text-[22px] md:text-[30px] font-semibold">
            {profileData?.posts.length}
          </div>
          <div className="text-[18px] md:text-[22px] text-[#ffffffc7]">
            Posts
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-[20px]">
            <div className="flex relative w-[40px] h-[40px]">
              {profileData?.followers?.slice(0, 3).map((user, index) => (
                <div
                  key={index}
                  className={`w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden absolute ${leftPositions[index]}`}
                >
                  <img
                    src={user?.profileImage || dp}
                    alt="Profile"
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-white text-[22px] md:text-[30px] font-semibold">
              {profileData?.followers.length}
            </div>
          </div>
          <div className="text-[18px] md:text-[22px] text-[#ffffffc7]">
            Followers
          </div>
        </div>
        <div>
          <div>
            <div className="flex items-center justify-center gap-[20px]">
              <div className="flex relative w-[40px] h-[40px]">
                {profileData?.following?.slice(0, 3).map((user, index) => (
                  <div
                    key={index}
                    className={`w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden absolute ${leftPositions[index]}`}
                  >
                    <img
                      src={user?.profileImage || dp}
                      alt="Profile"
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-white text-[22px] md:text-[30px] font-semibold">
                {profileData?.following.length}
              </div>
            </div>
          </div>
          <div className="text-[18px] md:text-[22px] text-[#ffffffc7]">
            Following
          </div>
        </div>
      </div>

      <div className="w-full h-[80px] flex justify-center items-center gap-[20px] mt-[10px]">
        {profileData?._id === userData?._id && (
          <button
            className="px-[10px] min-w-[150px] py-[-5px] h-[40px] bg-gray-300 cursor-pointer rounded-2xl"
            onClick={() => navigate("/editprofile")}
          >
            Edit Profile
          </button>
        )}

        {profileData?._id !== userData?._id && (
          <>
            <FollowButton
              targetUserId={profileData?._id}
              tailwind={
                "px-[10px] min-w-[150px] py-[-5px] h-[40px] bg-gray-300 cursor-pointer rounded-2xl"
              }
              onFollowChange={handleProfile}
            />
            <button
              className="px-[10px] min-w-[150px] py-[-5px] h-[40px] bg-gray-300 cursor-pointer rounded-2xl"
              onClick={() => {
                dispatch(setSelectedUser(profileData));
                navigate(`/messageArea`);
              }}
            >
              Message
            </button>
          </>
        )}
      </div>

      <div className="w-full min-h-[100vh] flex justify-center">
        <div className="w-full max-w-[900px] flex flex-col items-center rounded-t-[30px] bg-white relative gap-[20px] pt-[30px] pb-[100px]">
          {profileData?._id === userData?._id && (
            <div className="w-[90%] max-w-[500px] h-[80px] bg-white rounded-full flex justify-center items-center gap-[10px]">
              <div
                className={`${
                  postType === "posts"
                    ? "bg-black text-white shadow-2xl shadow-black"
                    : ""
                } w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold hover:bg-black rounded-full hover:text-white cursor-pointer hover:shadow-2xl hover:shadow-black`}
                onClick={() => setPostType("posts")}
              >
                Posts
              </div>

              <div
                className={`${
                  postType === "saved"
                    ? "bg-black text-white shadow-2xl shadow-black"
                    : ""
                } w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold hover:bg-black rounded-full hover:text-white cursor-pointer hover:shadow-2xl hover:shadow-black`}
                onClick={() => setPostType("saved")}
              >
                Saved
              </div>
            </div>
          )}

          <Nav />

          {profileData?._id === userData?._id && postData?.length === 0 && (
            <div className="text-[30px] font-semibold mt-[60px]">
              No post available
            </div>
          )}

          {profileData?._id === userData?._id && (
            <>
            
              {postType === "posts" &&
                postData?.map(
                  (post, index) =>
                    post.author?._id === profileData?._id && (
                      <Post key={index} post={post} />
                    )
                )}

              {postType === "saved" &&
                postData.map(
                  (post, index) =>
                    userData.saved.includes(post._id) && (
                      <Post post={post} key={index} />
                    )
                )}
            </>
          )}
          {profileData?._id !== userData?._id &&
            postData?.map(
              (post, index) =>
                post.author?._id === profileData?._id && (
                  <Post key={index} post={post} />
                )
            )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
