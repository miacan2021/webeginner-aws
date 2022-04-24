import { ButtonBase } from "@mui/material";
import React, { ReactElement, useState, useEffect } from "react";
import { Post } from "../API";
import Image from "next/image";
import { useRouter } from "next/router";
import { API, Auth, Storage } from "aws-amplify";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { useUser } from "../context/AuthContext";

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
  console.log(postImage);

  return (
    <ButtonBase onClick={() => router.push(`/post/${post.id}`)}>
      {post.image && postImage && (
        <Image
          src={`${postImage}`}
          height={200}
          width={200}
          layout="intrinsic"
          alt="post-image"
        />
      )}
      <div>{post.title}</div>
      <p>{post?.contents}</p>
    </ButtonBase>
  );
}
