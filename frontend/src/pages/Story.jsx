import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setStoryData } from "../redux/storySlice";
import StoryCard from "../components/StoryCard";

function Story() {
  const { userName } = useParams();
  const dispatch = useDispatch();

  const { storyData } = useSelector((state) => state.story);

  const handleStory = async () => {
    dispatch(setStoryData({})); // Reset story data before fetching
    try {
      const result = await axios.get(
        `${serverUrl}/api/story/getByUsername/${userName}`,
        {
          withCredentials: true,
        }
      );

      dispatch(setStoryData(result.data[0]));
      
    } catch (error) {
      console.error("Error fetching story:", error);
    }
  };

  useEffect(() => {
    if (userName) {
      handleStory();
    }
  }, [userName]);

  return (
    <div className="w-full h-[100vh] bg-black flex justify-center items-center">
      <StoryCard   />
    </div>
  );
}

export default Story;
