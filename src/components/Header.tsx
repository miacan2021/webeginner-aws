import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import React from "react";
import { useUser } from "../context/AuthContext";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
type Props = {
  title: string;
};
export default function Header({ title }: Props) {
  const { user } = useUser();
  const router = useRouter();

  const logoutUser = async () => {
    await Auth.signOut();
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <title>{title || "webeginner"}</title>
      </Head>
      <div className="w-full navbar bg-base-100 flex items-center justify-center">
        <div className="flex-1">
          <Link href="/">
            <a className="btn btn-ghost normal-case text-xl font-mono">
              webeginner
            </a>
          </Link>
        </div>
        <div className="gap-2">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered input-sm	md:input-md	"
            />
          </div>
          {user ? (
            <div className="flex gap-1">
              <button
                className="btn btn-accent"
                onClick={() => router.push("/create")}
              >
                Create
              </button>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full overflow-hidden">
                    <Image
                      layout="fill"
                      alt="usericon"
                      className="w-10 rounded-full"
                      src={"/icon.png"}
                    />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a className="justify-between font-semibold tracking-wider text-lg">
                      {user.username}
                    </a>
                  </li>
                  <li>
                    <Link href="/yourposts">
                      <a>Posts</a>
                    </Link>
                  </li>
                  <li onClick={logoutUser}>
                    <a>Logout</a>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn btn-accent btn-sm md:btn-md"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </button>
              <button
                className="btn btn-accent btn-sm md:btn-md"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
