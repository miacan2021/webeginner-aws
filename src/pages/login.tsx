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
  password: string;
}

const Login = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signInErr, setSignInErr] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const amplifyUser = await Auth.signIn(data.username, data.password);
    if (amplifyUser) {
      router.push("/");
    } else {
      throw new Error("something wrong");
    }
  };

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
        id="password"
        label="password"
        type="password"
        error={errors.password ? true : false}
        helperText={errors.password ? errors.password.message : null}
        {...register("password", {
          required: { value: true, message: "Please enter a password." },
        })}
      />

      <Button variant="contained" type="submit">
        Sign in
      </Button>

      {/* <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {signUpErr}
        </Alert> */}
    </form>
  );
};

export default Login;
