import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  useLoginMutation,
  CurrentUserQuery,
  CurrentUserDocument,
} from "../generated/graphql";
import { setAccessToken } from "../accessToken";

interface Props {}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login] = useLoginMutation();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        try {
          const response = await login({
            variables: {
              email,
              password,
            },
            update: (store, { data }) => {
              if (!data) {
                return null;
              }
              store.writeQuery<CurrentUserQuery>({
                query: CurrentUserDocument,
                data: {
                  currentUser: data.login.user,
                },
              });
            },
          });

          console.log("response", response);

          if (response && response.data) {
            setAccessToken(response.data.login.accessToken);
          }

          history.push("/");
        } catch (error) {
          console.error(error);

          // clear inputs? at least pwd
          setPassword("");
          // relate error to user - invalid login
          setError("invalid login");
        }
      }}
    >
      <div>
        <input
          value={email}
          placeholder="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <button type="submit">login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};
