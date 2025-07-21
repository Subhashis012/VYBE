import React, { use, useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setSearchData } from "../redux/userSlice";
import dp from "../assets/dp.jpg"; // Default profile image

function Search() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchData } = useSelector((state) => state.user);
  const [input, setInput] = useState("");

  const handleSearch = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/search?keyword=${input}`,
        { withCredentials: true }
      );
      dispatch(setSearchData(result.data));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [input]);

  return (
    <div className="w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px]">
      <div className="w-full h-[80px]  flex items-center gap-[20px] px-[20px] ">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(`/`)}
          className="text-white w-[25px] h-[25px] cursor-pointer"
        />
        <h1 className="text-white text-[20px] font-semibold">Search</h1>
      </div>

      <div className="w-full h-[80px] flex items-center justify-center">
        <form className="w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#0f1414] flex items-center px-[20px] gap-[10px]">
          <FiSearch className="text-white w-[18px] h-[18px] cursor-pointer" />
          <input
            type="text"
            placeholder="Search User........"
            className="bg-transparent border-none outline-none text-white w-full"
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </form>
      </div>

      {input.length === 0 ? (
        <div className="text-white">No search input</div>
      ) : (
        <div className="">
          {searchData?.map((user) => (
            <div
              className="w-[90vw] max-w-[700px] h-[60px] rounded-full hover:bg-gray-200 bg-white cursor-pointer flex items-center mt-[15px] gap-[20px] px-[5px]"
              onClick={() => navigate(`/profile/${user.userName}`)}
            >
              <div className="w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
                <img
                  src={user.profileImage || dp}
                  alt=""
                  className="w-full object-cover"
                />
              </div>

              <div className="text-black text-[18px] font-semibold">
                <div>{user.userName}</div>
                <div className="text-[14px] text-gray-400">{user.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
