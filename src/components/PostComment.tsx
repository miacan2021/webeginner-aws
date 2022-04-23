import React from "react";
import { Comment } from "../API";

type Props = {
  comment: Comment;
};

export const PostComment = ({ comment }: Props) => {
  return <div>Comments:{comment.content}</div>;
};
