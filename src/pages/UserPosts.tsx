import { useState, useEffect } from "react";
import Link from "next/link";
import { API, Auth } from "aws-amplify";
import { postsByUsername } from "../graphql/queries";
import { deletePost as deletePostMutation } from "../graphql/mutations";
import { UserAttributes, useUser } from "../context/AuthContext";
import { Post } from "../API";

type Props = {};

const UserPosts = (props: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useUser();
  const [loginUser, setLoginUser] = useState<string | undefined>("");
  useEffect(() => {
    setLoginUser(user?.attributes?.sub);
    if (loginUser) {
      fetchPosts(loginUser);
    }
  }, [loginUser, user]);

  async function fetchPosts(userSub: string | undefined) {
    const userVariable = { username: userSub };
    const postData: any = await API.graphql({
      query: postsByUsername,
      variables: userVariable,
    });
    setPosts(postData.data.listPosts.items);
    console.log(postData.data.listPosts.items);
  }
  async function deletePost(id: string) {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    fetchPosts(loginUser);
  }
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts &&
        posts.map((post: Post, index) => (
          <div key={index} className="border-b border-gray-300	mt-8 pb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-500 mt-2 mb-2">Author: {}</p>
            <Link href={`/edit-post/${post}`}>
              <a className="text-sm mr-4 text-blue-500">Edit Post</a>
            </Link>
            <Link href={`/posts/${post}`}>
              <a className="text-sm mr-4 text-blue-500">View Post</a>
            </Link>
            <button
              className="text-sm mr-4 text-red-500"
              onClick={() => deletePost(post.id)}
            >
              Delete Post
            </button>
          </div>
        ))}
    </>
  );
};

export default UserPosts;
