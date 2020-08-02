import React from "react";
import { Link } from "react-router-dom";
import {
  useCurrentUserQuery,
  useLogoutMutation,
} from "./generated/graphql";
import { setAccessToken } from "./accessToken";

interface Props {}

export const Header: React.FC<Props> = () => {
  const { data, loading } = useCurrentUserQuery();
  const [logout, { client }] = useLogoutMutation();

  let body: any = null;

  if (loading) {
    body = null;
  } else if (data && data.currentUser) {
    body = <div>you are logged in as: {data.currentUser.email}</div>;
  } else {
    body = <div>not logged in</div>;
  }

  return (
    <header>
      <div>
        <Link to="/">home</Link>
      </div>
      <div>
        <Link to="/register">register</Link>
      </div>
      <div>
        <Link to="/login">login</Link>
      </div>
      <div>
        <Link to="/currentUser">currentUser</Link>
      </div>
      <div>
        {!loading && data && data.currentUser ? (
          <button
            onClick={async () => {
              await logout();
              setAccessToken("");
              await client!.resetStore();
            }}
          >
            logout
          </button>
        ) : null}
      </div>
      {body}
    </header>
  );
};
