import React from "react";
import { Comment } from "../API";

type Props = {
  comment: Comment;
};

export const PostComment = ({ comment }: Props) => {
  return (
    <div>
      <p className="text-xl mb-1 mt-5">{comment.content}</p>
      <p className="font-mono text-primary border-b-2">
        {comment.owner} {new Date(comment.createdAt).toLocaleString()}
      </p>
    </div>
  );
};
