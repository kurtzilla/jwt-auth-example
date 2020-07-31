import React, { useState } from "react";
import { useRegisterMutation } from "../generated/graphql";
import { RouteComponentProps } from "react-router-dom";

export const Register: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [register] = useRegisterMutation();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        console.log("form submitted");

        try {
          const response = await register({
            variables: {
              email,
              password,
            },
          });

          console.log(response);

          history.push("/");
        } catch (error) {
          console.error(error);

          // clear inputs? at least pwd
          setPassword("");
          // relate error to user - invalid reg
          setError("invalid registration");
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
      <button type="submit">register</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};
