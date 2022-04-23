import { ButtonBase, Container } from "@mui/material";
import Image from "next/image";
import React from "react";
import { Post } from "../API";
import { useRouter } from "next/router";

type Props = {
  post: Post;
};

export default function PostPreview({ post }: Props) {
  const router = useRouter();
  return (
    <ButtonBase onClick={() => router.push(`/post/${post.id}`)}>
      {!post.image && (
        <Image
          src={"https://source.unsplash.com/random"}
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
