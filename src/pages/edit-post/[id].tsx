/* eslint-disable react-hooks/rules-of-hooks */
import React, { SetStateAction, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Storage } from "aws-amplify";
import { v4 as uuidv4 } from "uuid";
import { updatePost } from "../../graphql/mutations";
import { UpdatePostInput, UpdatePostMutation } from "../../API";
import { useRouter } from "next/router";
import ImageDropZone from "../../components/ImageDropZone";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { API } from "aws-amplify";
import { deletePost as deletePostMutation } from "../../graphql/mutations";
import { useUser } from "../../context/AuthContext";
import Header from "../../components/Header";

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
  const [file, setFile] = useState<string | File | undefined>("");
  const [fileType, setFileType] = useState<string | undefined>();
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
        tags: query.tags?.toString().replaceAll(",", " "),
      } as FormInput);
    }
    if (post.image !== "" || undefined) {
      const signedURL = Storage.get(post.image || "");
      signedURL.then((res) => setFile(res));
      download(post.image || "");
    }
  }, [fileType, post.image, query]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>();

  const onSubmit: SubmitHandler<FormInput> = async () => {
    let tagArray: Array<string> = (post.tags as string).split(" ");
    if (file !== "") {
      console.log("ari");
      try {
        const imagePath = !post.image ? uuidv4() : post.image;

        await Storage.put(imagePath, file, {
          contentType: fileType,
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

        router.push(`/post/${post.id}`);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else if (file === "" || !post.image) {
      console.log("nasi");
      const updatePostWithoutImageInput: UpdatePostInput = {
        id: post.id,
        title: post.title,
        contents: post.content,
        url: post.url,
        tags: tagArray,
        image: undefined,
      };
      const updatePosttWithoutImage = (await API.graphql({
        query: updatePost,
        variables: { input: updatePostWithoutImageInput },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as { data: UpdatePostMutation };
      await Storage.remove(`${post.image}`);
      router.push(`/post/${post.id}`);
    }
  };
  function onChangeElem(
    e: Event & {
      target: HTMLButtonElement;
    }
  ) {
    setPost((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }
  async function deletePost(id?: string, image?: string) {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    await Storage.remove(`${image}`);
    router.push(`/yourposts`);
  }
  return (
    <div className="mb-5 mx-auto w-10/12">
      <Header title={"edit" + post.id} />
      <h1 className="text-center text-2xl md:text-4xl mt-10 tracking-wider font-mono">
        Edit / Delete
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="flex flex-col justify-center items-center mt-5"
      >
        <input
          type="text"
          value={post.title}
          className="input input-accent w-5/6 lg:w-1/2 mb-3"
          id="title"
          {...register("title", {
            onChange: (e) => {
              onChangeElem(e);
            },
            minLength: 1,
            maxLength: 100,
          })}
        />
        <textarea
          value={post.content}
          className="textarea textarea-accent h-60 w-5/6 lg:w-1/2 mb-3"
          id="content"
          {...register("content", {
            onChange: (e) => {
              onChangeElem(e);
            },
            minLength: 1,
            maxLength: 1000,
          })}
        />
        <input
          type="text"
          value={post.url}
          className="input input-accent w-5/6 lg:w-1/2 mb-3"
          id="url"
          {...register("url", {
            onChange: (e) => {
              onChangeElem(e);
            },
            minLength: 1,
          })}
        />{" "}
        <input
          type="text"
          value={post.tags}
          className="input input-accent w-5/6 lg:w-1/2 mb-3"
          id="tags"
          {...register("tags", {
            onChange: (e) => {
              onChangeElem(e);
            },
            minLength: 1,
          })}
        />
        <ImageDropZone
          file={file}
          setFile={setFile}
          setFileType={setFileType}
        />
        <button className="btn btn-accent tracking-widest" type="submit">
          Edit
        </button>
      </form>
      <button
        className="btn btn-secondary tracking-widest"
        onClick={() => deletePost(post.id, post.image)}
      >
        Delete Post
      </button>
    </div>
  );
};

export default editPost;
