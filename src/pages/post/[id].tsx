import React from "react";
import { GetStaticProps, GetStaticPaths, GetStaticPathsResult } from "next";
import { API, withSSRContext } from "aws-amplify";
import { listPosts, getPost } from "../../graphql/queries";
import { ListPostsQuery, ListPostsQueryVariables } from "../../API";
import { ParsedUrlQuery } from "querystring";

type Props = {};

const individualPost = (props: Props) => {
  return <div>[id]</div>;
};

export default individualPost;

export const getStaticProps: GetStaticProps = async (context) => {
  const res = await fetch("https://.../posts");
  const posts = await res.json();
  return {
    props: {
      posts,
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
