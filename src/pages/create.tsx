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
import Header from "../components/Header";
import { ErrorMessage } from "@hookform/error-message";

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
    <>
      <Header title={"Create | webeginner"} />
      <div className="w-10/12 mx-auto">
        <h1 className=" text-center text-4xl mt-10 tracking-widest font-mono">
          Create Post
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          className=" flex flex-col gap-2 justify-center items-center mt-10"
        >
          <input
            type="text"
            placeholder="Title"
            className="input input-bordered  w-full max-w-xs"
            id="title"
            {...register("title", {
              required: "Required",
              maxLength: {
                value: 100,
                message: "This input exceed maxLength.",
              },
            })}
          />
          <ErrorMessage
            errors={errors}
            name="title"
            render={({ message }) => (
              <div className="alert alert-error shadow-md bg-secondary mt-3 w-1/3 mx-auto">
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
          <textarea
            placeholder="Content"
            className="textarea  textarea-bordered w-full max-w-md h-60"
            id="content"
            {...register("content", {
              required: true,
              maxLength: 1000,
            })}
          />
          <input
            type="text"
            placeholder="URL"
            className="input  input-bordered w-full max-w-xs"
            id="url"
            {...register("url", {
              required: true,
            })}
          />{" "}
          <input
            type="text"
            placeholder="Tags"
            className="input input-bordered  w-full max-w-xs"
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
    </>
  );
};

export default Create;
