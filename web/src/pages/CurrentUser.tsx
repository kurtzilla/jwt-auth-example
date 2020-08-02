import React from "react";
import { useCurrentUserQuery } from "../generated/graphql";

interface Props {}

export const CurrentUser: React.FC<Props> = () => {
  const { data, loading, error } = useCurrentUserQuery({
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>err</div>;
  }

  if (!data || !data.currentUser) {
    return <div>no data</div>;
  }

  console.log("DATA CU", data);
  return (
    <div>
      <div>{data.currentUser!.id}</div>
      <div>{data.currentUser!.email}</div>
      <div>{data.currentUser!.firstName}</div>
      <div>{data.currentUser!.lastName}</div>
    </div>
  );
};
