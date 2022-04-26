/* eslint-disable react-hooks/rules-of-hooks */
import React, { SetStateAction, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Storage } from "aws-amplify";
import { v4 as uuidv4 } from "uuid";
import { updatePost } from "../../graphql/mutations";
import { UpdatePostInput, UpdatePostMutation } from "../../API";
import { useRouter } from "next/router";
import ImageDropZone from "../../components/ImageDropZone";
import { useUser } from "../../context/AuthContext";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { API } from "aws-amplify";

interface FormInput {
  id?: string;
  title?: string;
  content?: string;
  image?: string;
  url?: string;
  tags?: string[] | string;
}

const editPost = () => {
  const router = useRouter();
  const query = router.query;
  const [file, setFile] = useState<string | File | undefined>();
  const [fileType, setFileType] = useState<string>("");
  const [post, setPost] = useState<FormInput>({
    id: "",
    title: "",
    content: "",
    url: "",
    image: "",
    tags: [],
  });
  async function download(key: string) {
    const result = await Storage.get(key, { download: true });
    setFileType(result.ContentType!);
  }
  useEffect(() => {
    if (query) {
      setPost({
        id: query.id,
        title: query.title,
        content: query.content,
        url: query.url,
        image: query?.image || "",
        tags: query.tags,
      } as FormInput);
    }
    if (post.image !== "") {
      const signedURL = Storage.get(post.image || "");
      signedURL.then((res) => setFile(res));
      download(post.image || "");
      console.log(fileType);
    }
  }, [fileType, post.image, query]);

  const { user } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>();

  const onSubmit: SubmitHandler<FormInput> = async () => {
    let tagArray: Array<string> = (post.tags as string).split(" ");
    if (file) {
      const updatePostWithoutImageInput: UpdatePostInput = {
        id: post.id,
        title: post.title,
        contents: post.content,
        url: post.url,
        tags: tagArray,
        image: post.image,
      };
      try {
        const imagePath = post.image || "";
        await Storage.put(imagePath, file, {
          contentType: typeof file === "string" ? fileType : file.type,
        });

        const updatePostInput: UpdatePostInput = {
          id: post.id,
          title: post.title,
          contents: post.content,
          image: imagePath,
          url: post.url,
        };

        const updateCurrentPost = (await API.graphql({
          query: updatePost,
          variables: { input: updatePostInput },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        })) as { data: UpdatePostMutation };

        console.log("New post created successfully:", updatePost);

        router.push(`/post/${post.id}`);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else {
      const updatePostWithoutImageInput: UpdatePostInput = {
        id: post.id,
        title: post.title,
        contents: post.content,
        url: post.url,
        tags: tagArray,
      };
      const updatePosttWithoutImage = (await API.graphql({
        query: updatePost,
        variables: { input: updatePostWithoutImageInput },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as { data: UpdatePostMutation };
      console.log("New post created successfully:", updatePost);

      router.push(`/post/${post.id}`);
    }
  };
  function onChangeElem(
    e: Event & {
      target: HTMLButtonElement;
    }
  ) {
    setPost(() => ({ ...post, [e.target.id]: e.target.value }));
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <input
          type="text"
          value={post.title}
          className="input w-full max-w-xs"
          id="title"
          {...register("title", {
            onChange: (e) => {
              onChangeElem(e);
            },

            maxLength: 100,
          })}
        />
        <textarea
          value={post.content}
          className="textarea"
          id="content"
          {...register("content", {
            onChange: (e) => {
              onChangeElem(e);
            },
            maxLength: 1000,
          })}
        />
        <input
          type="text"
          value={post.url}
          className="input w-full max-w-xs"
          id="url"
          {...register("url", {
            onChange: (e) => {
              onChangeElem(e);
            },
          })}
        />{" "}
        <input
          type="text"
          value={post.tags}
          className="input w-full max-w-xs"
          id="tags"
          {...register("tags", {
            onChange: (e) => {
              onChangeElem(e);
            },
          })}
        />
        <ImageDropZone file={file} setFile={setFile} />
        <button className="btn btn-accent" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default editPost;
