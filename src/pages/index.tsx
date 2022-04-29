import React, { useEffect, useState } from "react";
import { API } from "aws-amplify";
import type { NextPage } from "next";
import { useUser } from "../context/AuthContext";
import { listPosts } from "../graphql/queries";
import { ListPostsQuery, Post } from "../API";
import { Container } from "@mui/material";
import PostPreview from "../components/PostPreview";
import Header from "../components/Header";

const Home: NextPage = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    const fetchPostsFromApi = async (): Promise<Post[]> => {
      const allPosts = (await API.graphql({ query: listPosts })) as {
        data: ListPostsQuery;
        errors: any[];
      };
      if (allPosts.data) {
        setPosts(allPosts.data.listPosts?.items as Post[]);
        return allPosts.data.listPosts?.items as Post[];
      } else {
        throw new Error("Could not get posts");
      }
    };
    fetchPostsFromApi();
  }, []);

  return (
    <>
      <Header title={"webeginner"} />
      <div className="w-full mb-5">
        <div className="w-10/12 flex flex-col gap-3 justify-center items-center mx-auto">
          {posts
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((post) => (
              <PostPreview key={post.id} post={post} />
            ))}
        </div>
      </div>
    </>
  );
};

export default Home;
