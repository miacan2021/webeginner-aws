import { useState, useEffect } from "react";
import Link from "next/link";
import { API, Auth } from "aws-amplify";
import { postsByUsername } from "../graphql/queries";
import { deletePost as deletePostMutation } from "../graphql/mutations";
import { UserAttributes, useUser } from "../context/AuthContext";
import { Post } from "../API";
import Header from "../components/Header";

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
  }

  return (
    <div>
      <Header title={`${user?.username}page`} />
      <h1 className="text-center text-4xl mt-10 tracking-widest font-mono">
        {user?.username} Posts
      </h1>
      <div className="w-10/12 mx-auto mt-5">
        <div className="grid grid-cols-1 md:grid-col3 lg:grid-cols-4 gap-10 lg:gap-4 justify-items-center">
          {posts &&
            posts.map((post: Post) => (
              <div key={post.id} className="mt-5">
                <Link href={`/post/${post.id}`}>
                  <a className="cursor-pointer">
                    <div className="indicator">
                      <div className="indicator-item indicator-bottom">
                        <Link
                          href={{
                            pathname: `/edit-post/${post.id}`,
                            query: {
                              title: post.title,
                              content: post.contents,
                              image: post.image,
                              url: post.url,
                              tags: post.tags,
                            },
                          }}
                        >
                          <a className="text-sm mr-4 text-blue-500">
                            {" "}
                            <button className="btn btn-primary">
                              Edit / Delete
                            </button>
                          </a>
                        </Link>
                      </div>
                      <div className="card border">
                        <div className="card-body">
                          <h2 className="card-title">{post.title}</h2>
                          <p className="font-mono text-sm">
                            {new Date(post.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserPosts;
