import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { GetStaticProps, GetStaticPaths } from "next";
import { API, withSSRContext, Storage } from "aws-amplify";
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
import Header from "../../components/Header";
import Image from "next/image";
import Link from "next/link";
import { ErrorMessage } from "@hookform/error-message";

type FormInput = {
  content: string;
};

type Props = {
  post: Post;
};

const individualPost = ({ post }: Props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useForm<FormInput>();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [comments, setComments] = useState<(Comment | null)[]>([
    ...post.comments!.items,
  ]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [postImage, setPostImage] = useState<string | undefined>();

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
  }, [post, postImage]);

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
    <div className="w-full flex flex-col justify-center items-center mb-5">
      <Header title={post.title + post.id} />
      <h1 className="text-center text-2xl md:text-4xl mt-10 tracking-wider font-mono">
        {post.title}
      </h1>
      {post.image && postImage && (
        <Image
          src={`${postImage}`}
          height={300}
          width={350}
          layout="intrinsic"
          alt="post-image"
          className="object-contain overflow-hidden"
        />
      )}
      <p className="text-xl font-mono">{post.contents}</p>
      <p className="mt-4">Wanna check</p>
      <a className="link link-accent text-2xl" href={post.url}>
        Tutorial link
      </a>

      {(comments as Comment[])
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((comment) => (
          <PostComment key={comment.id} comment={comment} />
        ))}
      <div>
        <ErrorMessage
          errors={errors}
          name="content"
          render={({ message }) => (
            <div className="alert alert-error shadow-md bg-secondary mt-3 mx-auto">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Error! {message}</span>
              </div>
            </div>
          )}
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          className="flex mt-5 gap-2"
        >
          <input
            type="text"
            placeholder="comment"
            className="input input-primary w-96"
            id="content"
            {...register("content", {
              required: true,
              minLength: {
                value: 2,
                message: "This input exceed maxLength.",
              },
              maxLength: {
                value: 300,
                message: "This input exceed maxLength.",
              },
            })}
          />

          <button className="btn btn-accent" type="submit">
            Send!
          </button>
        </form>
      </div>
    </div>
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
