import type { NextApiRequest, NextApiResponse } from "next";

interface Handler {
  [key: string]: (req: NextApiRequest, res: NextApiResponse) => any;
}

interface HandlerOptions {
  authMethods?: string[];
  priviledgeMethods?: string[];
}

function apiHandler(handler: Handler, options?: HandlerOptions) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method;
    const authMethods = options?.authMethods || [];
    const priviledgeMethods = options?.priviledgeMethods || [];

    if (!Object.keys(handler).length || !method) {
      throw new Error("Api handler must have at least a method");
    }

    // check handler support of the specified HTTP method
    if (!handler[method]) {
      res.setHeader("Allow", Object.keys(handler));
      return res.status(405).json({ message: `Method ${method} not allowed` });
    }

    // // apply passed auth options
    // const isAuthMethod = authMethods.find((el) => el === method);
    // const isPriviledgeMethod = priviledgeMethods.find((el) => el === method);

    // if (options && (isAuthMethod || isPriviledgeMethod)) {
    //   // check auth token and attach user to request
    //   try {
    //     await checkAuth(req);
    //   } catch (err) {
    //     const error = err as CustomError;
    //     return res.status(error.status).json({ message: error.message });
    //   }

    //   // allow access to only sellers
    //   if (isPriviledgeMethod) {
    //     if (req.user!.role !== "Seller") {
    //       return res.status(403).json({
    //         message: "Insufficient credentials. Please sign up as an editor",
    //       });
    //     }
    //   }
    // }

    try {
      await handler[method](req, res);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Unexpected error on server. Try again later" });
    }
  };
}

export default apiHandler;
