import { ButtonBase } from "@mui/material";
import React, { ReactElement, useState, useEffect } from "react";
import { Post, Comment } from "../API";
import Image from "next/image";
import { useRouter } from "next/router";
import { API, Auth, Storage } from "aws-amplify";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { useUser } from "../context/AuthContext";
import { PostComment } from "./PostComment";

type Props = {
  post: Post;
};

export default function PostPreview({ post }: Props) {
  const router = useRouter();
  const [postImage, setPostImage] = useState<string | undefined>();

  useEffect(() => {
    async function getImageFromStorage() {
      try {
        const signedURL = await Storage.get(post.image!);
        setPostImage(signedURL);
      } catch (error) {
        console.log("No image found.");
      }
    }
    getImageFromStorage();
  }, []);

  return (
    <div
      onClick={() => router.push(`/post/${post.id}`)}
      className="w-full md:w-3/5 min-h-8 h-1/3 border flex flex-col items-center justify-center cursor-pointer py-5"
    >
      <h2 className="font-mono text-2xl">{post.title}</h2>
      {post.image && postImage && (
        <Image
          src={postImage}
          height={200}
          width={300}
          layout="intrinsic"
          alt="post-image"
          className="object-contain"
        />
      )}
      <p className="font-mono text-md">
        {post.contents.length >= 200
          ? post.contents.substr(0, 200) + "..."
          : post.contents}
      </p>
      <div className="flex gap-2">
        {post.tags.map((tag) => (
          <div className="badge badge-primary" key={tag + post.id}>
            {tag}
          </div>
        ))}
      </div>

      <p>{post.owner}</p>
    </div>
  );
}
