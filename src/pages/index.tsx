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
  console.log("user:", user);
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
  console.log("posts", posts);

  return (
    <Container maxWidth="md">
      <Header />
      {posts.map((post) => (
        <PostPreview key={post.id} post={post} />
      ))}
    </Container>
  );
};

export default Home;
