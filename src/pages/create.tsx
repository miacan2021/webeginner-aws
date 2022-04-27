import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Storage, API } from "aws-amplify";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../graphql/mutations";
import { CreatePostInput, CreatePostMutation } from "../API";
import { useRouter } from "next/router";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import ImageDropZone from "../components/ImageDropZone";
import { useUser } from "../context/AuthContext";

interface IFormInput {
  title: string;
  username: string | undefined | null;
  content: string;
  url: string;
  tags: Array<string> | string;
}

const Create = () => {
  const [file, setFile] = useState<string | undefined | File>();
  const [fileType, setFileType] = useState<string | undefined>();
  const router = useRouter();
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data);
    console.log(file);
    let tagArray: Array<string> = (data.tags as string).split(" ");
    if (file) {
      try {
        const imagePath = uuidv4();
        await Storage.put(imagePath, file, {
          contentType: fileType,
        });

        const createNewPostInput: CreatePostInput = {
          title: data.title,
          contents: data.content,
          image: imagePath,
          url: data.url,
          tags: tagArray,
          username: user?.attributes?.sub,
        };

        const createNewPost = (await API.graphql({
          query: createPost,
          variables: { input: createNewPostInput },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        })) as { data: CreatePostMutation };

        console.log("New post created successfully:", createNewPost);

        router.push(`/post/${createNewPost.data.createPost?.id}`);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else {
      const createNewPostWithoutImageInput: CreatePostInput = {
        title: data.title,
        contents: data.content,
        url: data.url,
        tags: tagArray,
        username: user?.attributes?.sub,
      };
      const createNewPostWithoutImage = (await API.graphql({
        query: createPost,
        variables: { input: createNewPostWithoutImageInput },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as { data: CreatePostMutation };

      router.push(`/post/${createNewPostWithoutImage.data.createPost?.id}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <input
          type="text"
          placeholder="Title"
          className="input w-full max-w-xs"
          id="title"
          {...register("title", {
            required: true,
            maxLength: 100,
          })}
        />
        <textarea
          placeholder="Content"
          className="textarea"
          id="content"
          {...register("content", {
            required: true,
            maxLength: 1000,
          })}
        />
        <input
          type="text"
          placeholder="URL"
          className="input w-full max-w-xs"
          id="url"
          {...register("url", {
            required: true,
          })}
        />{" "}
        <input
          type="text"
          placeholder="Tags"
          className="input w-full max-w-xs"
          id="tags"
          {...register("tags", {
            required: true,
          })}
        />
        <ImageDropZone
          file={file}
          setFile={setFile}
          setFileType={setFileType}
        />
        <button className="btn btn-accent" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Create;
