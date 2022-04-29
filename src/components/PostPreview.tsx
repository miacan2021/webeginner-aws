import React, { useState, useEffect } from "react";
import { Post } from "../API";
import Image from "next/image";
import { useRouter } from "next/router";
import { Storage } from "aws-amplify";

type Props = {
  post: Post;
};

export default function PostPreview({ post }: Props) {
  const router = useRouter();
  const [postImage, setPostImage] = useState<string | undefined>();

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
  }, []);

  return (
    <div
      onClick={() => router.push(`/post/${post.id}`)}
      className="w-full md:w-3/5 min-h-8 h-1/3 border flex flex-col items-center justify-center cursor-pointer py-5 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-center gap-2 flex-col lg:flex-row justify-center">
        <h2 className="font-mono text-2xl">{post.title}</h2>
        <p className="text-sm">{new Date(post.updatedAt).toLocaleString()}</p>
      </div>
      <div className="flex gap-2 mb-3">
        {post.tags.map((tag) => (
          <div className="badge badge-primary" key={tag + post.id}>
            {tag}
          </div>
        ))}
      </div>
      {post.image && postImage && (
        <Image
          src={postImage}
          height={200}
          width={300}
          layout="intrinsic"
          alt="post-image"
          className="object-contain"
        />
      )}
      <p className="font-mono text-md">
        {post.contents.length >= 200
          ? post.contents.substr(0, 200) + "..."
          : post.contents}
      </p>
      <div className="flex items-center gap-3 justify-end w-full mr-10">
        <p className="font-mono font-bold">{post.owner}</p>
        <div className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full overflow-hidden">
            <Image
              layout="fill"
              alt="usericon"
              className="w-10 rounded-full"
              src={"/icon.png"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
