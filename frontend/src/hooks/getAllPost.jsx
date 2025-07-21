import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setPostData } from "../redux/postSlice";

const getAllPost = () => {
    const dispatch = useDispatch();
    const {userData} = useSelector((state) => state.user);
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/post/getAll`, {
          withCredentials: true,
        });
        dispatch(setPostData(result.data));
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };
    fetchPost();
  }, [dispatch,userData]);

};

export default getAllPost;
