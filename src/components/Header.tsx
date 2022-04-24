import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import React from "react";
import { useUser } from "../context/AuthContext";

type Props = {};

export default function Header({}: Props) {
  const { user } = useUser();
  const router = useRouter();

  const logoutUser = async () => {
    await Auth.signOut();
  };
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">daisyUI</a>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered"
          />
        </div>
        {user ? (
          <>
            <button
              className="btn btn-accent"
              onClick={() => router.push("/create")}
            >
              Create
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="usericon"
                    src="https://api.lorem.space/image/face?hash=33791"
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <a className="justify-between">Profile</a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li onClick={logoutUser}>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <button
              className="btn btn-accent"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </button>
            <button
              className="btn btn-accent"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
