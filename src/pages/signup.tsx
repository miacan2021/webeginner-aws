import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Input, { Button, TextField } from "@mui/material";
import { CognitoUser } from "@aws-amplify/auth";
import { Auth } from "aws-amplify";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useUser } from "../context/AuthContext";
import { useRouter } from "next/router";
import Header from "../components/Header";

interface IFormInput {
  username: string;
  email: string;
  password: string;
  code: string;
}

const Signup = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signUpErr, setSignUpErr] = useState<string>("");
  const [showCode, setShowCode] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      if (showCode) {
        confirmSignUp(data);
      } else {
        await signUpWithEmailAndPassword(data);
        setShowCode(true);
      }
    } catch (error: any) {
      console.error(error);
      setSignUpErr(error.message);
      setOpen(true);
    }
  };

  async function signUpWithEmailAndPassword(
    data: IFormInput
  ): Promise<CognitoUser> {
    const { username, password, email } = data;
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email, // optional
        },
      });
      console.log("signed up user:", user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function confirmSignUp(data: IFormInput) {
    const { username, password, code } = data;
    try {
      await Auth.confirmSignUp(username, code);
      const amplifyUser = await Auth.signIn(username, password);
      if (amplifyUser) {
        router.push("/");
      } else {
        throw new Error("something wrong");
      }
    } catch (error) {
      console.log("error confirming sign up", error);
    }
  }
  return (
    <>
      <Header title={"Signup | webeginner"} />
      <h1 className=" text-center text-4xl mt-10 tracking-widest font-mono">
        Sign up
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
            id="email"
            label="email"
            type="email"
            error={errors.email ? true : false}
            helperText={errors.email ? errors.email.message : null}
            {...register("email", {
              required: { value: true, message: "Please enter a valid email." },
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
          {showCode && (
            <TextField
              id="code"
              label="varification code"
              type="text"
              error={errors.code ? true : false}
              helperText={errors.code ? errors.code.message : null}
              {...register("code", {
                required: { value: true, message: "Please enter a username." },
                maxLength: {
                  value: 6,
                  message: "Please enter a code 6 characters.",
                },
              })}
            />
          )}
          <button className="btn btn-primary tracking-widest" type="submit">
            {showCode ? "Confirm Code" : "Sign up"}
          </button>
        </div>
        {signUpErr && (
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
              <span>Error! {signUpErr}</span>
            </div>
          </div>
        )}
      </form>
    </>
  );
};

export default Signup;
