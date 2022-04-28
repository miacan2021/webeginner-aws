import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField } from "@mui/material";
import { Auth } from "aws-amplify";

import { useRouter } from "next/router";
import Header from "../components/Header";

interface IFormInput {
  username: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [signInErr, setSignInErr] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      await Auth.signIn(data.username, data.password);
      router.push("/");
    } catch (error) {
      setSignInErr("something wrong!");
    }
  };

  return (
    <>
      <Header title={"Signup | webeginner"} />
      <h1 className=" text-center text-4xl mt-10 tracking-widest font-mono">
        Login
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className=" mt-10"
      >
        <div className="flex flex-col gap-3 items-center justify-center">
          <TextField
            id="username"
            label="username"
            type="text"
            error={errors.username ? true : false}
            helperText={errors.username ? errors.username.message : null}
            {...register("username", {
              required: { value: true, message: "Please enter a username." },
              minLength: {
                value: 3,
                message: "Please enter a username between 3-16 characters.",
              },
              maxLength: {
                value: 16,
                message: "Please enter a username between 3-16 characters.",
              },
            })}
          />
          <TextField
            id="password"
            label="password"
            type="password"
            error={errors.password ? true : false}
            helperText={errors.password ? errors.password.message : null}
            {...register("password", {
              required: { value: true, message: "Please enter a password." },
            })}
          />
          <button className="btn btn-primary tracking-widest" type="submit">
            Login
          </button>
        </div>
        {signInErr && (
          <div className="alert alert-error shadow-md bg-secondary mt-10 w-1/3 mx-auto">
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
              <span>Error! {signInErr}</span>
            </div>
          </div>
        )}
      </form>
    </>
  );
};

export default Login;
