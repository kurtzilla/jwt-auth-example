import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "./entity/User";
import { MyContext } from "./MyContext";
import { createRefreshToken, createAccessToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";

@ObjectType()
class PayloadResponse {
  @Field()
  userId: string;
  @Field()
  email: string;
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  iat: string;
  @Field()
  exp: string;
}

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }

  // demonstrates an authenticated query
  // the bye method is simply a stub for testing the isAuth middleware
  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    console.log(payload);
    return `your user id is: ${payload!.userId}`;
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  currentUserID(@Ctx() { payload }: MyContext) {
    return payload!.userId;
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  currentUserEmail(@Ctx() { payload }: MyContext) {
    return payload!.email;
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  currentUserFullName(@Ctx() { payload }: MyContext) {
    return `${payload!.firstName} ${payload!.lastName}`;
  }

  @Query(() => PayloadResponse)
  @UseMiddleware(isAuth)
  currentUserPayload(@Ctx() { payload }: MyContext) {
    return payload!;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext) {
    const authorization = context.req.headers["authorization"];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(" ")[1];
      const payload: any = verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      );
      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");

    return true;
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(
    @Arg("userId", () => Int) userId: number
  ) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("could not find user");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("bad password");
    }

    // login successful

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  @Mutation(() => Boolean)
  async updateFirstName_LastName(
    @Arg("email") email: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string
  ) {
    // if (!firstName || firstName.trim().length == 0) {
    //   throw new Error("please supply a first name");
    // }
    // if (!lastName || lastName.trim().length == 0) {
    //   throw new Error("please supply a last name");
    // }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("could not find user");
    }

    user.firstName = firstName;
    user.lastName = lastName;

    try {
      user.save();
    } catch (error) {
      return false;
    }

    return true;
  }
}
