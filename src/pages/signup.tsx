import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Input, { Button, TextField } from "@mui/material";
import { CognitoUser } from "@aws-amplify/auth";
import { Auth } from "aws-amplify";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useUser } from "../context/AuthContext";
import { useRouter } from "next/router";

interface IFormInput {
  username: string;
  email: string;
  password: string;
  code: string;
}

const Signup = () => {
  const { user, setUser } = useUser();
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

  console.log("user from hook", user);

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
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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
      <Button variant="contained" type="submit">
        {showCode ? "Confirm Code" : "Sign up"}
      </Button>

      {/* <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {signUpErr}
        </Alert> */}
    </form>
  );
};

export default Signup;
