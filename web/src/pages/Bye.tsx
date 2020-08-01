import React from "react";
import { useByeQuery } from "../generated/graphql";

interface Props {}

export const CurrentUser: React.FC<Props> = () => {
  const { data, loading, error } = useByeQuery({
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>err</div>;
  }

  if (!data) {
    return <div>no data</div>;
  }

  console.log("DATA CU", data);
  return <div>{data.bye}</div>;
};
