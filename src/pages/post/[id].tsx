import React from "react";
import { GetStaticProps, GetStaticPaths, GetStaticPathsResult } from "next";
import { API, withSSRContext } from "aws-amplify";
import { listPosts, getPost } from "../../graphql/queries";
import { ListPostsQuery, GetPostQuery, Post, Comment } from "../../API";
import { ParsedUrlQuery } from "querystring";
import { PostComment } from "../../components/PostComment";

type Props = {
  post: Post;
};

const individualPost = ({ post }: Props) => {
  console.log("post", post);
  return (
    <div>
      {post.id}
      {post.contents}
      {(post.comments?.items as Comment[]).map((comment) => (
        <PostComment key={comment.id} comment={comment} />
      ))}
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
