import React, { useRef, useState } from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dp from "../assets/dp.jpg";
import axios from "axios";
import { serverUrl } from "../App";
import { setProfileData, setUserData } from "../redux/userSlice";
import ClipLoader from "react-spinners/ClipLoader";

function EditProfile() {
  const imageInput = useRef();
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [frontendImage, setFrontendImage] = useState(
    userData.profileImage || dp
  );
  const [backendImage, setBackendImage] = useState(null);
  const [name, setName] = useState(userData.name || "");
  const [userName, setUserName] = useState(userData.userName || "");
  const [bio, setBio] = useState(userData.bio || "");
  const [profession, setProfession] = useState(userData.profession || "");
  const [gender, setGender] = useState(userData.gender || "");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleEditProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("userName", userName);
      formData.append("bio", bio);
      formData.append("profession", profession);
      formData.append("gender", gender);
      if (backendImage) {
        formData.append("profileImage", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/user/editProfile`,
        formData,
        { withCredentials: true }
      );
      dispatch(setProfileData(result.data));
      dispatch(setUserData(result.data));
      setLoading(false);
      navigate(`/profile/${userData.userName}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px] p-[20px]">
      <div className="w-full h-[80px]  flex items-center gap-[20px] px-[20px] ">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(`/profile/${userData?.userName}`)}
          className="text-white w-[25px] h-[25px] cursor-pointer"
        />
        <h1 className="text-white text-[20px] font-semibold">Edit Profile</h1>
      </div>

      <div
        className="w-[80px]  h-[80px] md:w-[100px] md:h-[100px] border-2 border-black rounded-full cursor-pointer overflow-hidden"
        onClick={() => imageInput.current.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          hidden
          onChange={handleImage}
        />
        <img
          src={frontendImage}
          alt="Profile"
          className="w-full object-cover"
        />
      </div>

      <div
        className="text-blue-500 text-center text-[18px] cursor-pointer"
        onClick={() => imageInput.current.click()}
      >
        Change Your Profile Picture
      </div>

      <input
        type="text"
        className="w-[90%] text-white font-semibold max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] outline-none"
        placeholder="Enter Your Name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <input
        type="text"
        className="w-[90%] text-white font-semibold max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] outline-none"
        placeholder="User Name"
        onChange={(e) => setUserName(e.target.value)}
        value={userName}
      />
      <input
        type="text"
        className="w-[90%] text-white font-semibold max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] outline-none"
        placeholder="Bio"
        onChange={(e) => setBio(e.target.value)}
        value={bio}
      />
      <input
        type="text"
        className="w-[90%] text-white font-semibold max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] outline-none"
        placeholder="Profession"
        onChange={(e) => setProfession(e.target.value)}
        value={profession}
      />
      <select
        className="w-[90%] text-white font-semibold max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] outline-none"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="" disabled>
          Select Gender
        </option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Others">Others</option>
      </select>
      <button
        onClick={handleEditProfile}
        className="px-[10px] w-[60%] max-w-[400px] py-[5px] h-[50px] bg-white cursor-pointer rounded-2xl"
      >
        {loading ? <ClipLoader size={30} color="black" /> : "Save Profile"}
      </button>
    </div>
  );
}

export default EditProfile;
