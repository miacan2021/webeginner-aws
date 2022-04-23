import { ButtonBase, Container } from "@mui/material";
import Image from "next/image";
import React from "react";
import { Post } from "../API";

type Props = {
  post: Post;
};

export default function PostPreview({ post }: Props) {
  return (
    <ButtonBase>
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
