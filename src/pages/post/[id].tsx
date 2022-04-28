import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { GetStaticProps, GetStaticPaths } from "next";
import { API, withSSRContext } from "aws-amplify";
import { listPosts, getPost } from "../../graphql/queries";
import {
  ListPostsQuery,
  GetPostQuery,
  Post,
  Comment,
  CreateCommentInput,
  CreateCommentMutation,
} from "../../API";
import { PostComment } from "../../components/PostComment";
import { createComment } from "../../graphql/mutations";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";

type FormInput = {
  content: string;
};

type Props = {
  post: Post;
};

const individualPost = ({ post }: Props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { register, handleSubmit } = useForm<FormInput>();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [comments, setComments] = useState<(Comment | null)[]>(
    post.comments!.items
  );

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    const newCommentInput: CreateCommentInput = {
      postID: post.id,
      content: data.content,
    };
    const createNewComment = (await API.graphql({
      query: createComment,
      variables: { input: newCommentInput },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })) as { data: CreateCommentMutation };
    setComments([...comments, createNewComment.data.createComment as Comment]);
  };
  return (
    <>
      {post.id}
      {post.contents}
      {(comments as Comment[])
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((comment) => (
          <PostComment key={comment.id} comment={comment} />
        ))}
      <div>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <input
            type="text"
            placeholder="content"
            className="input w-full max-w-xs"
            id="content"
            {...register("content", {
              required: true,
              minLength: 2,
              maxLength: 100,
            })}
          />
          <button className="btn btn-accent" type="submit">
            Send!
          </button>
        </form>
      </div>
    </>
  );
};

export default individualPost;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const SSR = withSSRContext();
  const postQuery = (await SSR.API.graphql({
    query: getPost,
    variables: { id: params!.id },
  })) as { data: GetPostQuery };
  return {
    props: {
      post: postQuery.data.getPost as Post,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const SSR = withSSRContext();
  const response = (await SSR.API.graphql({ query: listPosts })) as {
    data: ListPostsQuery;
    errors: any[];
  };
  const paths = response.data.listPosts!.items.map((post) => ({
    params: { id: post!.id },
  }));

  return { paths, fallback: "blocking" };
};
